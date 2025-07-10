from PyQt5.QtGui import QImage
import numpy as np

def qimage_to_numpy(qimage):
    qimage = qimage.convertToFormat(QImage.Format_RGB888)
    width = qimage.width()
    height = qimage.height()

    ptr = qimage.bits()
    if ptr is None:
        raise ValueError("Error")
    ptr.setsize(qimage.byteCount())
    arr = np.array(ptr).reshape(height, width, 3)  
    return arr
