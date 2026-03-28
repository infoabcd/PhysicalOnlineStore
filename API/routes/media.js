const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { verifyAdmin } = require('../middleware/verify');

const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/upload-multiple', verifyAdmin, upload.array('images', 30), (req, res) => {
  const files = req.files || [];
  const fileNames = files.map((f) => f.filename);
  const filePaths = fileNames.map((n) => `media/images/${n}`);
  return res.status(200).json({ fileNames, filePaths });
});

router.get('/images/:name', (req, res) => {
  const safe = path.basename(req.params.name);
  const filePath = path.join(uploadDir, safe);
  if (!filePath.startsWith(uploadDir)) {
    return res.status(400).end();
  }
  return res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).end();
    }
  });
});

module.exports = router;
