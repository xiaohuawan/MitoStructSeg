import os
import yaml
import time
import argparse
import numpy as np
import torch
import torch.optim as optim

from collections import defaultdict
from loguru import logger
from glob import glob
from torch.cuda.amp import GradScaler, autocast
from attrdict import AttrDict

from model.AMM_Seg import AMM_Seg
from utils.train_utils import setup_seed
from utils.loss_utils import CrossEntropy2d, BCELoss
from utils.train_utils import adjust_learning_rate
from utils.train_utils import inference_results
from utils.train_utils import get_current_consistency_weight
from dataset.source_dataset import sourceDataSet, get_source_data
from dataset.target_dataset import targetDataSet, targetDataSet_val, Evaluation

import warnings
warnings.filterwarnings("ignore")


def init_project(cfg):
    logger.info('Initialization ... ', end='', flush=True)
    t1 = time.time()

    setup_seed(cfg.TRAIN.random_seed)
    if cfg.TRAIN.if_cuda:
        if torch.cuda.is_available() is False:
            raise AttributeError('No GPU available')
        torch.backends.cudnn.enabled = True
        torch.backends.cudnn.benchmark = True     

    prefix = cfg.time
    if cfg.TRAIN.resume:
        model_name = cfg.TRAIN.model_name
    else:
        model_name = prefix + '_' + cfg.NAME
    cfg.cache_path = os.path.join(cfg.TRAIN.cache_path, model_name)
    cfg.save_path = os.path.join(cfg.TRAIN.save_path, model_name)
    cfg.record_path = os.path.join(cfg.save_path, model_name)
    cfg.valid_path = os.path.join(cfg.save_path, 'valid')
    if cfg.TRAIN.resume is False:
        if not os.path.exists(cfg.cache_path):
            os.makedirs(cfg.cache_path)
        if not os.path.exists(cfg.save_path):
            os.makedirs(cfg.save_path)
        if not os.path.exists(cfg.record_path):
            os.makedirs(cfg.record_path)
        if not os.path.exists(cfg.valid_path):
            os.makedirs(cfg.valid_path)
    logger.info('Done (time: %.2fs)' % (time.time() - t1))


def load_dataset(cfg):
    logger.info('Caching datasets ... ', end='', flush=True)
    t1 = time.time()
    source_data = sourceDataSet(cfg.DATA.source_data,
                                crop_size=(cfg.DATA.input_size, cfg.DATA.input_size),
                                stride=cfg.DATA.source_stride,train_num=cfg.TRAIN.train_num)
    train_provider = torch.utils.data.DataLoader(source_data,
                                           batch_size=cfg.TRAIN.batch_size,
                                           shuffle=False,
                                           num_workers=cfg.TRAIN.num_workers)
    
    if cfg.TRAIN.if_valid:
        val_data = targetDataSet_val(cfg.DATA.data_dir_target,
                                            crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
                                            stride=cfg.DATA.target_stride)
        valid_provider = torch.utils.data.DataLoader(val_data,
                                           batch_size=1,
                                           shuffle=False)
    else:
        valid_provider = None
    logger.info('Done (time: %.2fs)' % (time.time() - t1))
    return train_provider, valid_provider

def build_model(cfg):
    logger.info('Building model on ', end='', flush=True)
    t1 = time.time()
    device = cfg.TRAIN.device
    cfg.MODEL.output_nc = 1
    model = AMM_Seg(n_channels=cfg.MODEL.input_nc, n_classes=cfg.MODEL.output_nc).to(device)

    logger.info('Done (time: %.2fs)' % (time.time() - t1))
    return model

def resume_params(cfg, model, optimizer, resume):
    if resume:
        t1 = time.time()
        model_path = os.path.join(cfg.save_path, 'model-%06d.ckpt' % cfg.TRAIN.model_id)

        logger.info('Resuming weights from %s ... ' % model_path, end='', flush=True)
        if os.path.isfile(model_path):
            checkpoint = torch.load(model_path)
            model.load_state_dict(checkpoint['model_weights'])
        else:
            raise AttributeError('No checkpoint found at %s' % model_path)
        logger.info('Done (time: %.2fs)' % (time.time() - t1))
        logger.info('valid %d' % checkpoint['current_iter'])
        return model, optimizer, checkpoint['current_iter']
    else:
        return model, optimizer, 0
    

def loop(cfg, train_provider, valid_provider, model, optimizer, iters):
    f_loss_txt = open(os.path.join(cfg.record_path, 'loss.txt'), 'a')
    f_loss_adv_txt = open(os.path.join(cfg.record_path, 'loss_adv.txt'), 'a')
    f_valid_txt = open(os.path.join(cfg.record_path, 'valid.txt'), 'a')
    f_valid_map_txt = open(os.path.join(cfg.record_path, 'valid_map.txt'), 'a')
    sum_time = 0.0
    sum_loss_supervised = 0.0
    sum_loss_cpred = 0.0
    sum_loss_apred = 0.0
    sum_loss_diff = 0.0
    sum_loss_cross_target = 0.0
    target_stride = cfg.DATA.target_stride
    device = cfg.TRAIN.device
    
    target_data = targetDataSet(cfg.DATA.data_dir_target,
                                crop_size=(cfg.DATA.input_size_target, cfg.DATA.input_size_target),
                                stride=cfg.DATA.target_stride)
    targetloader = torch.utils.data.DataLoader(target_data,
                                         batch_size=cfg.TRAIN.batch_size,
                                         shuffle=True,
                                         num_workers=cfg.TRAIN.num_workers)
    if cfg.TRAIN.if_valid:
        target_evaluation = Evaluation(cfg.DATA.data_dir_target_label)
    
    trainloader_iter = enumerate(train_provider)
    targetloader_iter = enumerate(targetloader)

    # build loss functions
    criterion_seg = CrossEntropy2d().to(device)
    criterion_adv = BCELoss()
    
    # labels for adversarial training
    source_label = 0
    target_label = 1
    
    while iters <= cfg.TRAIN.total_iters:
        iters += 1
        t1 = time.time()
        model.train()

        optimizer.zero_grad()


        _, batch = trainloader_iter.__next__()
        cimg_source, clabel_source, aimg_source, alabel_source, dlabel_source,cfilter_source,afilter_source = batch
        cimg_source = cimg_source.to(device)
        aimg_source = aimg_source.to(device)
        cfilter_source = cfilter_source.to(device)
        afilter_source = afilter_source.to(device)
        clabel_source = clabel_source.to(device)
        alabel_source = alabel_source.to(device)
        dlabel_source = dlabel_source.to(device)
        img_cat = torch.cat([cimg_source, aimg_source], dim=1)
        filter_cat = torch.cat([cfilter_source, afilter_source], dim=1)
        scaler = GradScaler()
        loss_classify = 0
        with autocast():
            cpred_source, apred_source, dpred_source, domain_output = model(img_cat, filter_cat)
            
            loss_cpred = criterion_seg(cpred_source, clabel_source.long())
            loss_apred = criterion_seg(apred_source, alabel_source.long())
            loss_diff = criterion_seg(dpred_source, dlabel_source.long()) 
            loss_classify = criterion_adv(domain_output, target_label)

            if cfg.TRAIN.consistency_weight_rampup:
                consistency_weight = get_current_consistency_weight(iters, consistency=cfg.TRAIN.weight_cross, consistency_rampup=cfg.TRAIN.rampup_iters)
            else:
                consistency_weight = cfg.TRAIN.weight_cross

            loss = loss_cpred + loss_apred + loss_diff + loss_classify * cfg.TRAIN.weight_class
            sum_loss_cpred += loss_cpred.item()
            sum_loss_apred += loss_apred.item()
            
        scaler.scale(loss).backward()
        sum_loss_supervised += loss.item()
        sum_loss_diff += loss_diff.item()
        
        if iters % cfg.TRAIN.display_freq == 0 or iters == 1:
            logger.info(f"source_loss={loss_cpred }---{ loss_apred }---{ loss_diff }---{ loss_classify}")
            
            
        _, batch = targetloader_iter.__next__()
        cimg_target, _, aimg_target, _, _,cfilter_target,afilter_target = batch
        cimg_target = cimg_target.to(device)
        aimg_target = aimg_target.to(device)
        cfilter_target = cfilter_target.to(device)
        afilter_target = afilter_target.to(device)
        img_cat_target = torch.cat([cimg_target, aimg_target], dim=1)
        filter_cat_target = torch.cat([cfilter_target, afilter_target], dim=1)
        with autocast():
            cpred_target, apred_target, dpred_target, domain_output = model(img_cat_target, filter_cat_target)

            cpred_target_detach = cpred_target.clone().detach()
            cpred_target_detach = torch.argmax(cpred_target_detach, dim=1)
            apred_target_detach = apred_target.clone().detach()
            apred_target_detach = torch.argmax(apred_target_detach, dim=1)
            dpred_target_detach = dpred_target.clone().detach()
            dpred_target_detach = torch.argmax(dpred_target_detach, dim=1)
            clabel_target_cross = torch.abs(apred_target_detach - dpred_target_detach)
            alabel_target_cross = torch.abs(cpred_target_detach - dpred_target_detach)
            loss_cpred_cross_target = criterion_seg(cpred_target, clabel_target_cross.long()) * consistency_weight
            loss_apred_cross_target = criterion_seg(apred_target, alabel_target_cross.long()) * consistency_weight
            loss_classify = criterion_adv(domain_output, source_label)
            loss = loss_cpred_cross_target + loss_apred_cross_target + loss_classify * cfg.TRAIN.weight_class
            sum_loss_cross_target += loss.item()

        scaler.scale(loss).backward()
        
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1)

        scaler.step(optimizer)
        scaler.update()
        
        sum_time += time.time() - t1
        
        if iters % cfg.TRAIN.display_freq == 0 or iters == 1:
            logger.info(f"target_loss={loss_cpred_cross_target }---{ loss_apred_cross_target }---{ loss_classify }")
        
        if cfg.TRAIN.if_valid:
            if iters % cfg.TRAIN.valid_freq == 0 or iters == 1:
                model.eval()
                preds = np.zeros((41, 800, 800), dtype=np.uint8)
                for i_pic, (cimg, _, aimg, _, _, cfilter, afilter) in enumerate(valid_provider):
                    cimg = cimg.to(device)
                    aimg = aimg.to(device)
                    cfilter = cfilter.to(device)
                    afilter = afilter.to(device)
                    img_cat = torch.cat([cimg, aimg], dim=1)
                    filter_cat = torch.cat([cfilter,afilter], dim=1)
                    with torch.no_grad():
                        cpred, apred, _, _ = model(img_cat,filter_cat)
                    preds[i_pic] = inference_results(cpred, preds[i_pic])
                    preds[i_pic+target_stride] = inference_results(apred, preds[i_pic+target_stride])
                mean_dice, mean_jac = target_evaluation.metric_dice(preds[:-1])
                total_mAP,total_F1,total_MCC,total_IoU = target_evaluation.metric_map(preds[:-1])
                mean_mAP, mean_F1, mean_MCC, mean_IoU = sum(total_mAP)/len(total_mAP),sum(total_F1)/len(total_F1),sum(total_MCC)/len(total_MCC),sum(total_IoU)/len(total_IoU)
                logger.info('model-%d, dice=%.6f, jac=%.6f' % (iters, mean_dice, mean_jac))
                logger.info('model-%d, mAP=%.6f, F1=%.6f, MCC=%.6f, IoU=%.6f' % (iters, mean_mAP, mean_F1, mean_MCC, mean_IoU))
                f_valid_txt.write('model-%d, dice=%.6f, jac=%.6f' % (iters, mean_dice, mean_jac))
                f_valid_txt.write('\n')
                f_valid_txt.flush()
                f_valid_map_txt.write('model-%d, mAP=%.6f, F1=%.6f, MCC=%.6f, IoU=%.6f' % (iters, mean_mAP, mean_F1, mean_MCC, mean_IoU))
                f_valid_map_txt.write('\n')
                f_valid_map_txt.flush()
                torch.cuda.empty_cache()

        if iters % cfg.TRAIN.save_freq == 0:
            states = {'current_iter': iters, 'valid_result': None,
                    'model_weights': model.state_dict()}
            torch.save(states, os.path.join(cfg.save_path, 'model-%06d.ckpt' % iters))
            logger.info('***************save modol, iters = %d.***************' % (iters), flush=True)
    f_loss_txt.close()
    f_loss_adv_txt.close()
    f_valid_txt.close()



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-c', '--cfg', type=str, default='patient1_config', help='path to config file')
    args = parser.parse_args()

    cfg_file = args.cfg + '.yaml'
    logger.info('cfg_file: ' + cfg_file)

    with open('./config/' + cfg_file, 'r') as f:
        cfg = AttrDict(yaml.load(f, Loader=yaml.FullLoader))
    
    source_data = get_source_data(cfg.DATA.data_dir_source)
    cfg["DATA"]["source_data"] = source_data


    timeArray = time.localtime()
    time_stamp = time.strftime('%Y-%m-%d--%H-%M-%S', timeArray)
    logger.info('time stamp:', time_stamp)
    cfg.path = cfg_file
    cfg.time = time_stamp
    

    init_project(cfg)

    train_provider, valid_provider = load_dataset(cfg)
    model = build_model(cfg)
    if cfg.TRAIN.opt_type == 'adam':
        optimizer = optim.Adam(model.parameters(), lr=cfg.TRAIN.learning_rate, betas=(0.9, 0.99))
    else:
        optimizer = optim.SGD(model.parameters(), lr=cfg.TRAIN.learning_rate, momentum=0.9, weight_decay=0.0005)
    model, optimizer, init_iters = resume_params(cfg, model, optimizer, cfg.TRAIN.resume)
    loop(cfg, train_provider, valid_provider, model, optimizer, init_iters)

 