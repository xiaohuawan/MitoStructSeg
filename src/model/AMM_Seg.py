import torch
import torch.nn as nn
import torch.nn.functional as F
from loguru import logger
from torch import einsum

class DoubleConv(nn.Module):
    """(conv => BN => ReLU) * 2"""

    def __init__(self, in_ch, out_ch):
        super(DoubleConv, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            # nn.BatchNorm2d(out_ch),
            nn.InstanceNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            # nn.BatchNorm2d(out_ch),
            nn.InstanceNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        x = self.conv(x)
        return x


class Inconv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super(Inconv, self).__init__()
        self.conv = DoubleConv(in_ch, out_ch)

    def forward(self, x):
        x = self.conv(x)
        return x


class Down(nn.Module):
    def __init__(self, in_ch, out_ch):
        super(Down, self).__init__()
        self.mpconv = nn.Sequential(nn.MaxPool2d(2), DoubleConv(in_ch, out_ch))

    def forward(self, x):
        x = self.mpconv(x)
        return x


class Up(nn.Module):
    def __init__(self, in_ch, out_ch, bilinear=False):
        super(Up, self).__init__()

        #  would be a nice idea if the upsampling could be learned too,
        #  but my machine do not have enough memory to handle all those weights
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        else:
            self.up = nn.ConvTranspose2d(in_ch // 2, in_ch // 2, 2, stride=2)

        self.conv = DoubleConv(in_ch, out_ch)

    def forward(self, x1, x2):
        x1 = self.up(x1)
        # diffX = x1.size()[2] - x2.size()[2]
        # diffY = x1.size()[3] - x2.size()[3]
        # x2 = F.pad(x2, (diffX // 2, int(diffX / 2), diffY // 2, int(diffY / 2)))
        x = torch.cat([x2, x1], dim=1)
        x = self.conv(x)
        return x


class Up_cat3(nn.Module):
    def __init__(self, in_ch, out_ch, bilinear=False):
        super(Up_cat3, self).__init__()

        #  would be a nice idea if the upsampling could be learned too,
        #  but my machine do not have enough memory to handle all those weights
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
        else:
            self.up = nn.ConvTranspose2d(in_ch // 3, in_ch // 3, 2, stride=2)

        self.conv = DoubleConv(in_ch, out_ch)

    def forward(self, x1, x2, x3):
        x1 = self.up(x1)
        # diffX = x1.size()[2] - x2.size()[2]
        # diffY = x1.size()[3] - x2.size()[3]
        # x2 = F.pad(x2, (diffX // 2, int(diffX / 2), diffY // 2, int(diffY / 2)))
        x = torch.cat([x3, x2, x1], dim=1)
        x = self.conv(x)
        return x


class Upself(Up):
    def forward(self, x):
        x = self.up(x)
        x = self.conv(x)
        return x


class Outconv(nn.Module):
    def __init__(self, in_ch, out_ch, sig):
        super(Outconv, self).__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 1)
        self.act = nn.Sigmoid()
        self.sig = sig

    def forward(self, x):
        x = self.conv(x)
        if self.sig:
            x = self.act(x)
        return x


class Outconv2(nn.Module):
    def __init__(self, in_ch, out_ch, sig):
        super(Outconv2, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, in_ch, 3, padding=1),
            # nn.BatchNorm2d(in_ch),
            nn.InstanceNorm2d(in_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
        )
        self.act = nn.Sigmoid()
        self.sig = sig

    def forward(self, x):
        x = self.conv(x)
        if self.sig:
            x = self.act(x)
        return x


class DomainClassifier(nn.Module):
    def __init__(self):
        super(DomainClassifier, self).__init__()
        self.classifier = nn.Sequential(
            nn.Linear(2048, 1024),
            nn.ReLU(),
            nn.Linear(1024, 2),
            nn.Softmax(dim=1)
        )

    def forward(self, x):
        x = x.view(x.size(0), -1) 
        return self.classifier(x)


class GradientReversalLayer(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x):
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        return -grad_output


class ZeroConv2d(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super(ZeroConv2d, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)

        nn.init.zeros_(self.conv.weight)

        if self.conv.bias is not None:
            nn.init.zeros_(self.conv.bias)

    def forward(self, x):
        return self.conv(x)



class AMM_Seg(nn.Module):
    def __init__(self, n_channels, n_classes, sig=False, encoder_weights='imagenet'):
        super().__init__()
        self.inc = Inconv(n_channels, 64)

        self.down1 = Down(64, 128)
        self.down2 = Down(256, 256)
        self.down3 = Down(256, 512)
        self.down4 = Down(512, 512)

        # decoder
        self.up1 = Up(1024, 256)
        self.up2 = Up(512, 128)
        self.up3_1 = Up(256, 64)
        self.up3_2 = Up(256, 64)
        self.up4_1 = Up(128, 32)
        self.up4_2 = Up(128, 32)
        
        self.up1_diff = Up(1024, 256)
        self.up2_diff = Up(512, 128)
        self.up3_diff = Up_cat3(128*3, 64)
        self.up4_diff = Up_cat3(64*3, 32)
        
        self.out_1 = Outconv2(32, n_classes, sig=sig)
        self.out_2 = Outconv2(32, n_classes, sig=sig)
        self.out_diff = Outconv2(32, n_classes, sig=sig)

        self.domain_classifier = nn.Sequential(
            nn.Linear(512*2*2, 1024),
            nn.ReLU(),
            nn.Linear(1024, 2)
        )
        
        self.afd_module = AFD(s_channels=2, c_channels=2, conv_cfg=None, norm_cfg=None, act_cfg=None, h=2)

    def forward(self, x, x_texture, diff=True):
        x1 = x[:, 0:1, :, :]
        x2 = x[:, 1::, :, :]

        x1_texture = x_texture[:, 0:1, :, :]
        x2_texture = x_texture[:, 1::, :, :]
        
        img_size = x1.shape
        
        # encoder
        down0_1 = self.inc(x1)  
        down0_2 = self.inc(x2)  
        down1_1 = self.down1(down0_1)   
        down1_2 = self.down1(down0_2)  
        x_cat = torch.cat([down1_1, down1_2], dim=1)   
        down2 = self.down2(x_cat)  
        down3 = self.down3(down2)   
        down4 = self.down4(down3)  

        # texture encoder
        down0_1_texture = self.inc(x1_texture)   
        down0_2_texture = self.inc(x2_texture)   
        down1_1_texture = self.down1(down0_1_texture)   
        down1_2_texture = self.down1(down0_2_texture)  
        x_cat_texture = torch.cat([down1_1_texture, down1_2_texture], dim=1)   
        down2_texture = self.down2(x_cat_texture)   
        down3_texture = self.down3(down2_texture)  
        down4_texture = self.down4(down3_texture)  


        #AFD 
        down4_size = down4.shape
        down4 = down4.reshape(down4.shape[0], 2, img_size[2], img_size[3])
        down4_texture = down4_texture.reshape(down4_texture.shape[0], 2, img_size[3], img_size[3])
        s_feat1, c_feat1, down4_afd = self.afd_module(down4, down4_texture)
        down4_afd = down4_afd.reshape(down4_afd.shape[0], down4_size[1], down4_size[2], down4_size[3])
        

        # decoder
        up1 = self.up1(down4_afd, down3)  
        up2 = self.up2(up1, down2)  
        up3_1 = self.up3_1(up2, down1_1)   
        up3_2 = self.up3_2(up2, down1_2)  
        up4_1 = self.up4_1(up3_1, down0_1)   
        up4_2 = self.up4_2(up3_2, down0_2)  
        
        # output
        out_1 = self.out_1(up4_1)   
        out_2 = self.out_2(up4_2)   
        
        # classification
        avg_pooled = F.adaptive_avg_pool2d(down4_afd, (2, 2))
        grl_feature = GradientReversalLayer.apply(avg_pooled.view(avg_pooled.size(0), -1))
        domain_out = self.domain_classifier(grl_feature)
        

        if diff:
            # decoder2
            up1_diff = self.up1_diff(down4_afd, down3)
            up2_diff = self.up2_diff(up1_diff, down2)
            up3_diff = self.up3_diff(up2_diff, down1_1, down1_2)
            up4_diff = self.up4_diff(up3_diff, down0_1, down0_2)
            out_diff = self.out_diff(up4_diff)
            
            return out_1, out_2, out_diff, domain_out
        else:
            return out_1, out_2
        


class GradientReversalLayer(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x):
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        return -grad_output




class AFD(nn.Module):
    "Active fusion decoder"
    def __init__(self, s_channels, c_channels, conv_cfg, norm_cfg, act_cfg, h=2):
        super(AFD, self).__init__()
        self.s_channels = s_channels
        self.c_channels = c_channels
        self.h = h
        self.scale = h ** -0.5
        self.spatial_att = ChannelAtt(s_channels, s_channels, conv_cfg, norm_cfg, act_cfg)
        self.context_att = ChannelAtt(c_channels, c_channels, conv_cfg, norm_cfg, act_cfg)
        self.qkv = nn.Linear(s_channels + c_channels, (s_channels + c_channels) * 3, bias=False)
        self.proj = nn.Linear(s_channels + c_channels, s_channels + c_channels)
        self.proj_drop = nn.Dropout(0.1)

    def forward(self, sp_feat, co_feat):
        # **_att: B x C x 1 x 1
        s_feat, s_att = self.spatial_att(sp_feat)
        c_feat, c_att = self.context_att(co_feat)
        b = s_att.shape[0]  # h = 1, w = 1

        # Combine spatial and context attentions
        sc_att = torch.cat([s_att, c_att], 1).view(b, -1)  # [B,2C]

        # Compute Q, K, V for self-attention
        qkv = self.qkv(sc_att).reshape(b, 3, -1)  # [B, 3, 2C]
        q, k, v = qkv[:, 0], qkv[:, 1], qkv[:, 2]  # [B, 2C], [B, 2C], [B, 2C]

        # Self-attention mechanism
        attn_weights = torch.softmax(torch.matmul(q, k.transpose(-2, -1)) * self.scale, dim=-1)  # [B, 2C, 2C]
        attn_output = torch.matmul(attn_weights, v)  # [B, 2C]

        # Project and reshape the output
        fuse_weight = self.proj(attn_output)
        fuse_weight = self.proj_drop(fuse_weight)
        fuse_weight = fuse_weight.reshape(b, -1, 1, 1)  # [B, C, 1, 1]

        # Split the fused weights
        fuse_s, fuse_c = fuse_weight[:, :self.s_channels], fuse_weight[:, -self.c_channels:]

        # Compute the final output
        out = (1 + fuse_s) * s_feat + (1 + fuse_c) * c_feat

        return s_feat, c_feat, out


class ChannelAtt(nn.Module):
    def __init__(self, in_channels, out_channels, conv_cfg, norm_cfg, act_cfg):
        super(ChannelAtt, self).__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.conv_1x1 = ConvModule(out_channels, out_channels, 1, stride=1, padding=0, conv_cfg=conv_cfg,
                                   norm_cfg=norm_cfg, act_cfg=None)

    def forward(self, x):
        """Forward function."""
        if self.in_channels == 1:
            atten = torch.mean(x, dim=(2, 3), keepdim=True)
            # Expand the single channel to multi-channel for further processing
            atten = atten.expand(-1, self.out_channels, -1, -1)
        else:
            atten = torch.mean(x, dim=(2, 3), keepdim=True)
        atten = self.conv_1x1(atten)
        return  x,atten
    


class ConvModule(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1,
                 conv_cfg=None, norm_cfg=None, act_cfg=None):
        super(ConvModule, self).__init__()
        self.conv_cfg = conv_cfg if conv_cfg is not None else {'type': 'Conv2d'}
        self.norm_cfg = norm_cfg if norm_cfg is not None else {'type': 'BatchNorm2d'}
        self.act_cfg = act_cfg if act_cfg is not None else {'type': 'ReLU', 'inplace': True}

        # Create convolution layer
        if self.conv_cfg['type'] == 'Conv2d':
            self.conv = nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups)
        elif self.conv_cfg['type'] == 'Conv1d':
            self.conv = nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups)
        # Add more types as needed

        # Create normalization layer
        if self.norm_cfg['type'] == 'BatchNorm2d':
            self.norm = nn.BatchNorm2d(out_channels)
        elif self.norm_cfg['type'] == 'BatchNorm1d':
            self.norm = nn.BatchNorm1d(out_channels)
        # Add more types as needed

        # Create activation layer
        if self.act_cfg['type'] == 'ReLU':
            self.activation = nn.ReLU(inplace=self.act_cfg.get('inplace', True))
        elif self.act_cfg['type'] == 'LeakyReLU':
            self.activation = nn.LeakyReLU(negative_slope=0.01, inplace=self.act_cfg.get('inplace', True))
        # Add more types as needed

    def forward(self, x):
        x = self.conv(x)
        if self.norm_cfg is not None:
            x = self.norm(x)
        if self.act_cfg is not None:
            x = self.activation(x)
        return x


class SelfAttention(nn.Module):
    def __init__(self, in_channels, dim=None):
        super(SelfAttention, self).__init__()
        self.query_conv1 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.key_conv1 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.value_conv1 = nn.Conv2d(in_channels, in_channels, kernel_size=1)
        self.query_conv2 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.key_conv2 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.value_conv2 = nn.Conv2d(in_channels, in_channels, kernel_size=1)
        self.softmax = nn.Softmax(dim=-1)
        
    def forward(self, x1, x2):
        # x1, x2 shape: [batch_size, channels, dim, dim]
        m_batchsize, C, width, height = x1.size()

        # 生成查询、键、值
        proj_query1 = self.query_conv1(x1).view(m_batchsize, -1, width * height).permute(0, 2, 1)  # [B, N, C]
        proj_key1 = self.key_conv1(x2).view(m_batchsize, -1, width * height)  # [B, C, N]
        proj_value1 = self.value_conv1(x2).view(m_batchsize, -1, width * height)  # [B, C, N]
        
        # 计算注意力得分
        energy1 = torch.bmm(proj_query1, proj_key1)  # [B, N, N]
        attention1 = self.softmax(energy1)  # Softmax over the last dimension

        # 应用注意力机制得到输出
        out1 = torch.bmm(proj_value1, attention1.permute(0, 2, 1))
        out1 = out1.view(m_batchsize, C, width, height)
        
        # 可以选择将注意力输出与输入相加形成残差连接
        out = out1 + x1
        return out
    


class CrossAttention(nn.Module):
    def __init__(self, in_channels, dim=None):
        super(CrossAttention, self).__init__()
        self.query_conv1 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.key_conv1 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.value_conv1 = nn.Conv2d(in_channels, in_channels, kernel_size=1)
        self.query_conv2 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.key_conv2 = nn.Conv2d(in_channels, in_channels // 8, kernel_size=1)
        self.value_conv2 = nn.Conv2d(in_channels, in_channels, kernel_size=1)
        self.softmax = nn.Softmax(dim=-1)
        
    def forward(self, x1, x2):
        # x1, x2 shape: [batch_size, channels, dim, dim]
        m_batchsize, C, width, height = x1.size()

        # 生成查询、键、值
        proj_query1 = self.query_conv1(x1).view(m_batchsize, -1, width * height).permute(0, 2, 1)  # [B, N, C]
        proj_key1 = self.key_conv1(x2).view(m_batchsize, -1, width * height)  # [B, C, N]
        proj_value1 = self.value_conv1(x2).view(m_batchsize, -1, width * height)  # [B, C, N]
        
        proj_query2 = self.query_conv2(x1).view(m_batchsize, -1, width * height).permute(0, 2, 1)  # [B, N, C]
        proj_key2 = self.key_conv2(x2).view(m_batchsize, -1, width * height)  # [B, C, N]
        proj_value2 = self.value_conv2(x2).view(m_batchsize, -1, width * height)  # [B, C, N]

        # 计算注意力得分
        energy1 = torch.bmm(proj_query1, proj_key1)  # [B, N, N]
        attention1 = self.softmax(energy1)  # Softmax over the last dimension
        energy2 = torch.bmm(proj_query2, proj_key2)  # [B, N, N]
        attention2 = self.softmax(energy2)  # Softmax over the last dimension
        # 应用注意力机制得到输出
        out1 = torch.bmm(proj_value1, attention1.permute(0, 2, 1))
        out1 = out1.view(m_batchsize, C, width, height)
        out2 = torch.bmm(proj_value2, attention2.permute(0, 2, 1))
        out2 = out2.view(m_batchsize, C, width, height)
        
        # 可以选择将注意力输出与输入相加形成残差连接
        out = x1 + x2 + out1 + out2
        return out