const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { verifyAdmin } = require('../middleware/verify');

// 设置图片存储目录
const imagesDir = path.join(__dirname, '../uploads/images');

// GET 图片路由
router.get('/images/:fileName', async(req, res) => {
    const fileName = req.params.fileName;
    const imageUrl = path.join(imagesDir, fileName);

    res.sendFile(fileName, { root: imagesDir }, (err) => {
        if (err) {
            console.error('图片发送出错:', err);
            res.status(500).json({ message: '服务器内部错误.' });
        }
    });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);        // 定义(获得)时间戳
        const fileExtension = path.extname(file.originalname);                          // 定义(获得)文件后缀名
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);                  // 写入文件，格式：文件名-时间戳.后缀
    }
});
// 配置上传
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 * 5 }, // 限制文件大小为 5MB * 5 = 25MB (允许最多5张图片)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('错误：文件上传仅支持以下文件类型 - ' + filetypes));
    }
});

// POST 多图片上传路由
// 使用 upload.array('images', 5) 来处理最多 5 个名为 'images' 的文件
router.post('/upload-multiple', verifyAdmin, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '未找到上传文件。' });
        }

        const fileNames = req.files.map(file => file.filename);
        const filePaths = fileNames.map(fileName => `media/images/${fileName}`);

        res.status(200).json({
            message: '文件上传成功！',
            fileNames: fileNames,
            filePaths: filePaths
        });

    } catch (error) {
        console.error('文件上传出错:', error);
        res.status(500).json({ message: '服务器内部错误。' });
    } 
});

module.exports = router;