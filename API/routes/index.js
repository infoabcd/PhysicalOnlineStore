const express = require('express');
const router = express.Router();
const db = require('../models');
const { Commodity, Category } = db;

function parsePagination(req) {
  const rawPage = parseInt(req.query.page, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 12));
  return { page, limit, offset: (page - 1) * limit };
}

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const { rows, count } = await Commodity.findAndCountAll({
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return res.json({ rows, count });
  } catch (err) {
    console.error('列出商品失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Commodity.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: '未找到商品.' });
    }
    return res.json(product);
  } catch (err) {
    console.error('获取商品失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

module.exports = router;
