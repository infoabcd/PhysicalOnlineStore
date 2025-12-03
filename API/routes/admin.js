const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');                       // 密码加密用

const { generateToken } = require('../auth/jwt');       // 生成 Token
const { verifyAdmin, checkLogin } = require('../middleware/verify');      // 验证登陆 Token(管理员) | 验证是否登陆

const db = require('../models');
const { User, Commodity, Category, sequelize } = db;

// GET 判断路由
router.get('/login', checkLogin, async(req, res) => {
    if (!req.user) {
        return res.status(403).json({ message: '用户未登陆' });
    }
    if (req.user) {
        return res.status(200).json({ message: '欢迎回来' });
    }
});

// POST 登陆路由
router.post('/login', checkLogin, async(req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const userQuery = await User.findOne({
            where: {
                username: username
            },
        });
        
        if (userQuery == null) {
            return res.status(403).json({ message: '输入的账号或密码有误，请重试' });
        }
        
        const passwordIsValid = await bcrypt.compare(password, userQuery.password);
        if (!passwordIsValid) {
            return res.status(403).json({ message: '输入的账号或密码有误，请重试' });
        }

        // 发送 payload 给 generateToken 来生成 Token
        const token = generateToken({
            id: userQuery.id,
            username: userQuery.username,
            role: userQuery.role
        })

        // 返回 Cookie 到前端
        res.cookie('authToken', token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),        // 24小时后过期
            httpOnly: true,
            secure: false
        });
        res.status(200).json({ 
            message: '登陆成功'
        });
    } catch (error) {
        console.error('登陆出现出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// POST 创建商品路由
router.post('/create', verifyAdmin, async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            title,                      // 标题
            description,                // 商品介绍
            price,                      // 售价
            shipping_fee,               // 邮费
            original_price,             // 进货价
            promotion_price,            // 折扣价
            is_on_promotion,            // 是否折扣
            discount_amount,            // 折扣多少钱
            stock,                      // 库存
            imageUrls,                  // 新增：图片 URL 数组
            categories                  // 新增：从前端获取的分类 ID 数组
        } = req.body;

        if (!title || !price || !original_price || !stock || !categories || !Array.isArray(categories)) {
            await t.rollback();
            return res.status(400).json({ message: '缺少必要的商品信息或分类信息.' });
        }

        const newCommodity = await Commodity.create({
            title: title,
            description: description || null,
            price: price,
            shipping_fee: (shipping_fee !== undefined && shipping_fee !== null) ? Number(shipping_fee) : null,
            original_price: original_price,
            promotion_price: is_on_promotion ? promotion_price : null,
            is_on_promotion: is_on_promotion,
            discount_amount: discount_amount || null,
            stock: stock,
            image_urls: imageUrls || [] // 将图片URL数组存储为JSON字符串
        }, { transaction: t });

        const foundCategories = await Category.findAll({
            where: {
                id: categories
            },
            transaction: t
        });

        await newCommodity.setCategories(foundCategories, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: '商品创建成功！',
            commodity: newCommodity
        });

    } catch (error) {
        await t.rollback();
        console.error('创建商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// DELETE 删除商品路由
router.delete('/delete/:id', verifyAdmin, async(req, res) => {
    try {
        const commodityId = req.params.id;
        const commodity = await Commodity.findByPk(commodityId);
        
        if (!commodity) {
            res.status(404).json({ message: '你想要删除的商品不存在.' });
        }

        await commodity.destroy();
        res.status(200).json({ message: '商品删除成功！' });
    } catch (error) {
        console.error('删除商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// PUT 更新商品路由
router.put('/update/:id', verifyAdmin, async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const commodityId = req.params.id;
        const {
            title,
            description,
            price,
            shipping_fee,
            original_price,
            promotion_price,
            is_on_promotion,
            discount_amount,
            stock,
            imageUrls,
            categories
        } = req.body;

        if (!title || !price || !original_price || !stock || !categories || !Array.isArray(categories)) {
            await t.rollback();
            return res.status(400).json({ message: '缺少必要的商品信息或分类信息.' });
        }

        const commodity = await Commodity.findByPk(commodityId, { transaction: t });

        if (!commodity) {
            await t.rollback();
            return res.status(404).json({ message: '要更新的商品不存在.' });
        }

        await commodity.update({
            title,                                                              // 标题
            description: description || null,                                   // 商品介绍
            price,                                                              // 售价
            shipping_fee: (shipping_fee !== undefined && shipping_fee !== null) ? Number(shipping_fee) : null, // 邮费
            original_price,                                                     // 进货价
            promotion_price: is_on_promotion ? promotion_price : null,          // 折扣价
            is_on_promotion,                                                    // 是否折扣
            discount_amount: is_on_promotion ? discount_amount : null,          // 折扣了多少钱
            stock,                                                              // 库存
            image_urls: imageUrls || []                                         // 图片URL数组
        }, { transaction: t });

        const foundCategories = await Category.findAll({
            where: {
                id: categories
            },
            transaction: t
        });

        await commodity.setCategories(foundCategories, { transaction: t });

        await t.commit();

        res.status(200).json({
            message: '商品更新成功！',
            commodity: commodity
        });
    } catch (error) {
        await t.rollback();
        console.error('更新商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});


// 类别管理
router.get('/categories', verifyAdmin, async(req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json(categories);
    } catch (error) {
        console.error('获取分类失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

router.post('/categories', verifyAdmin, async(req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: '缺少分类名称.' });
        }
        const exists = await Category.findOne({ where: { name } });
        if (exists) {
            return res.status(409).json({ message: '分类已存在.' });
        }
        const newCat = await Category.create({ name });
        return res.status(201).json(newCat);
    } catch (error) {
        console.error('新增分类失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

router.delete('/categories/:id', verifyAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        const cat = await Category.findByPk(id);
        if (!cat) return res.status(404).json({ message: '未找到分类.' });
        await cat.destroy();
        return res.status(200).json({ message: '分类已删除.' });
    } catch (error) {
        console.error('删除分类失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

module.exports = router;