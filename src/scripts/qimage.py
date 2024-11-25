from PyQt5.QtGui import QImage
import numpy as np

def qimage_to_numpy(qimage):
    """将QImage转换为numpy.ndarray。"""
    # 确保我们使用QImage.bits()可以处理的格式。
    qimage = qimage.convertToFormat(QImage.Format_RGB888)
    width = qimage.width()
    height = qimage.height()

    ptr = qimage.bits()
    # 确保ptr不是None。
    if ptr is None:
        raise ValueError("无法检索QImage位。图像可能无效。")
    ptr.setsize(qimage.byteCount())
    arr = np.array(ptr).reshape(height, width, 3)  # RGB格式为3通道
    return arr