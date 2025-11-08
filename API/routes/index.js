const express = require('express');
const router = express.Router();

const { checkLogin } = require('../middleware/verify');      // 验证是否登陆

const db = require('../models');
const { Commodity, Category } = db;

// GET 主页路由
router.get('/', checkLogin, async(req, res) => {
    
    try {
        const role = req.user?.role;
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        if (!role) {
            const products = await Commodity.findAndCountAll({
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'shipping_fee',
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
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            });
            return res.status(200).json(products);
        } else {
            const products = await Commodity.findAndCountAll({
                distinct: true,
                limit: limit,
                offset: offset,
                
                include: [{
                    model: Category,
                    as: 'categories',
                }]
            })
            return res.status(200).json(products);
        }
    } catch(error) {
        console.error('获取商品列表失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 详细商品路由
router.get('/products/:id', checkLogin, async(req, res) => {
    try {
        const id = req.params.id;
        const role = req.user?.role;
        
        if (!role) {
            const productsData = await Commodity.findByPk(id, {
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'shipping_fee',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_urls'
                ],
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            if (productsData == null) {
                return res.status(200).json( {message: '没有找到对应的商品.' })
            } else {
                return res.status(200).json(productsData)
            };
        } else {
            const productsData = await Commodity.findByPk(id, {
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            if (productsData == null) {
                return res.status(200).json( {message: '没有找到对应的商品.' })
            } else {
                return res.status(200).json(productsData)
            };
        }
    } catch(error) {
        console.log('获取具体商品信息失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

module.exports = router;