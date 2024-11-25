const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/api/images', (req, res) => {
  const folderPath = path.join(__dirname, 'public', 'free', 'class_predict');
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read directory' });
    }
    const imageFiles = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file)); // 过滤出图片文件
    res.json(imageFiles);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
