const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const db = require('../models');
const { Commodity, Category } = db;

function parsePagination(req) {
  const rawPage = parseInt(req.query.page, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 12));
  return { limit, offset: (page - 1) * limit };
}

router.get('/title/t', async (req, res) => {
  try {
    const title = req.query.title ? String(req.query.title).trim() : '';
    if (!title) {
      return res.status(400).json({ message: '缺少 title 参数.', rows: [], count: 0 });
    }
    const { limit, offset } = parsePagination(req);
    const { rows, count } = await Commodity.findAndCountAll({
      where: {
        title: { [Op.like]: `%${title}%` },
      },
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return res.json({ rows, count });
  } catch (err) {
    console.error('标题搜索失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

router.get('/assort/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { limit, offset } = parsePagination(req);
    const { rows, count } = await Commodity.findAndCountAll({
      distinct: true,
      col: 'Commodity.id',
      include: [
        {
          model: Category,
          as: 'categories',
          where: { id: categoryId },
          through: { attributes: [] },
          required: true,
        },
      ],
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return res.json({ rows, count });
  } catch (err) {
    console.error('分类商品列表失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

module.exports = router;
