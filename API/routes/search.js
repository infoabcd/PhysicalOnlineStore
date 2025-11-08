const express = require('express');
const router = express.Router();

const db = require('../models');
const { Commodity, Category } = db;

const { Op } = require('sequelize'); // 模糊匹配用(Operators)，记得sequelize和Sequelize有本质区别的

// GET 搜索功能路由(ID)
router.get('/:key', async(req, res) => {
    try {
        const key = req.params.key;

        const role = req.user?.role;
        if (!role) {
            const searchData = await Commodity.findByPk(key, {
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_urls'
                ],
                distinct: true,
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            return res.status(200).json(searchData);
        } else {
            const searchData = await Commodity.findByPk(key, {
                distinct: true,
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            return res.status(200).json(searchData);
        }
    } catch(error) {
        console.error('搜索商品的Key出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 搜索功能路由(Title)
router.get('/title/t', async(req, res) => {
    try {
        const title = req.query.title;

        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        const Commodities = await Commodity.findAndCountAll({
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'promotion_price',
                'is_on_promotion',
                'discount_amount',
                'stock',
                'image_urls'
            ],
            distinct: true,
            limit: limit,
            offset: offset,

            include: [{
                model: Category,
                as: 'categories',
            }],

            where: {
                title: {
                    [Op.like]: `%${title}%`
                }
            }
        })

        if (title == null || Commodities.count == 0) {
            return res.status(200).json({ message: '未找到对应的商品.' });
        }

        return res.status(200).json(Commodities);

    } catch (error) {
        console.error('搜索商品标题时出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
})

// GET 分类功能
router.get('/assort/:key', async(req, res) => {
    try {
        const role = req.user?.role;

        // 分类功能 params
        const key = req.params.key;
        if (key == null) {
            res.status(200).json({ message: '未找到分类.' });
        };
        
        // 分页功能 query
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        const totalCommodities = await Commodity.count({
            distinct: true,
            include: [{
                model: Category,
                as: 'categories',
                where: {
                    id: key
                },
                through: { attributes: [] }
            }]
        });

        if (!role) {
            const Commodities = await Commodity.findAll({
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_urls'
                ],
                limit: limit,
                offset: offset,
                include: [{
                    model: Category,
                    as: 'categories',
                    where: {
                        id: key
                    },
                    through: { attributes: [] }
                }]
            });

            const totalPages = Math.ceil(totalCommodities / limit);

            return res.status(200).json({
                Page: page,
                totalCommodities: totalCommodities,
                rows: Commodities,
                totalPages: totalPages,
            });
        } else {
            const Commodities = await Commodity.findAll({
                limit: limit,
                offset: offset,
                include: [{
                    model: Category,
                    as: 'categories',
                    where: {
                        id: key
                    },
                    through: { attributes: [] }
                }]
            });

            const totalPages = Math.ceil(totalCommodities / limit);

            return res.status(200).json({
                Page: page,
                totalCommodities: totalCommodities,
                searchData: Commodities,
                totalPages: totalPages,
            })
        }
        
    } catch(error) {
        console.error('搜索商品的分区出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

module.exports = router;
