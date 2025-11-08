const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/categories', async (req, res) => {
  try {
    const categories = await db.Category.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json(categories);
  } catch (err) {
    console.error('获取分类失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

module.exports = router;
