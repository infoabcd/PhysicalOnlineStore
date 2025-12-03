const express = require('express');
const router = express.Router();

const { verifyAdmin } = require('../middleware/verify');
const { createOrder: paypalCreateOrder, captureOrder: paypalCaptureOrder, buildPurchaseUnit } = require('../services/paypal');
const config = require('../config');

const db = require('../models');
const { sequelize, Order, OrderItem, Commodity } = db;

function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `${y}${m}${d}${hh}${mm}${ss}-${rand}`;
}

const safeDecimal = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const parseQuantity = (value) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : 1;
};

const roundCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
};

const formatCurrency = (value) => roundCurrency(value).toFixed(2);

async function buildOrderPricing(items, transaction) {
  const commodityIds = items.map((i) => i.commodity_id);
  const commodities = await Commodity.findAll({ where: { id: commodityIds }, transaction });

  const commodityMap = new Map(commodities.map((c) => [String(c.id), c]));

  const rows = [];
  let itemsSubtotal = 0;
  let shippingTotal = 0;

  for (const item of items) {
    const commodity = commodityMap.get(String(item.commodity_id));
    if (!commodity) {
      return null;
    }

    const quantity = parseQuantity(item.quantity);
    const basePrice = roundCurrency(
      commodity.is_on_promotion && commodity.promotion_price != null
        ? safeDecimal(commodity.promotion_price)
        : safeDecimal(commodity.price)
    );
    const shippingFee = roundCurrency(safeDecimal(commodity.shipping_fee));

    const lineSubtotal = roundCurrency(basePrice * quantity);
    const lineShipping = roundCurrency(shippingFee * quantity);
    const lineTotal = roundCurrency(lineSubtotal + lineShipping);

    itemsSubtotal = roundCurrency(itemsSubtotal + lineSubtotal);
    shippingTotal = roundCurrency(shippingTotal + lineShipping);

    rows.push({
      commodity,
      quantity,
      unitPrice: basePrice,
      shippingFee,
      lineSubtotal,
      lineShipping,
      lineTotal,
    });
  }

  const discountTotal = 0;
  const orderTotal = roundCurrency(itemsSubtotal + shippingTotal - discountTotal);

  const paypalItems = rows.map((row) => ({
    title: row.commodity.title,
    unit: row.unitPrice,
    quantity: row.quantity,
  }));

  return {
    rows,
    totals: {
      itemsSubtotal,
      shippingTotal,
      discountTotal,
      total: orderTotal,
    },
    paypalItems,
  };
}

// 创建订单（预下单 + 调用 PayPal 创建订单）
router.post('/create', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      email,
      country,
      region,
      address1,
      address2,
      postal_code,
      phone,
      currency = 'USD',
      items
    } = req.body;

    const normalized = {
      email: email && String(email).trim(),
      country: country && String(country).trim(),
      region: region && String(region).trim(),
      address1: address1 && String(address1).trim(),
      address2: address2 && String(address2).trim(),
      postal_code: postal_code && String(postal_code).trim(),
      phone: phone && String(phone).trim(),
    };

    if (!normalized.email || !normalized.country || !normalized.region || !normalized.address1 || !normalized.phone || !normalized.postal_code || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: '缺少必要的订单信息或商品项。' });
    }

    // 拉取商品价格并计算总价
    const pricing = await buildOrderPricing(items, t);
    if (!pricing) {
      await t.rollback();
      return res.status(400).json({ message: '存在无效的商品ID。' });
    }

    const { rows: itemRows, totals, paypalItems } = pricing;
    const orderTotal = totals.total;

    // 先创建本地订单（PENDING）——为兼容数据库非空约束，这里预先分配一个 order_no
    const preOrderNo = generateOrderNo();
    const order = await Order.create({
      order_no: preOrderNo,
      email,
      country,
      region,
      address1,
      address2: normalized.address2 || null,
      postal_code: normalized.postal_code,
      phone: normalized.phone,
      currency,
      total_amount: formatCurrency(orderTotal),
      status: 'PENDING'
    }, { transaction: t });

    // 创建订单项
    for (const row of itemRows) {
      await OrderItem.create({
        order_id: order.id,
        commodity_id: row.commodity.id,
        title_snapshot: row.commodity.title,
        unit_price: formatCurrency(row.unitPrice),
        quantity: row.quantity,
        line_total: formatCurrency(row.lineTotal)
      }, { transaction: t });
    }

    // 调用 PayPal 创建订单
    const purchaseUnit = buildPurchaseUnit({
      total: orderTotal,
      currency,
      items: paypalItems,
      shipping: totals.shippingTotal,
      discounts: totals.discountTotal,
    });

    const ppResp = await paypalCreateOrder({ total: orderTotal, currency, purchaseUnit });
    const paypalOrderId = ppResp?.result?.id;
    if (!paypalOrderId) {
      await t.rollback();
      return res.status(500).json({ message: '创建 PayPal 订单失败。' });
    }

    await order.update({ paypal_order_id: paypalOrderId }, { transaction: t });

    await t.commit();
    return res.status(200).json({ paypalOrderId });
  } catch (err) {
    await t.rollback();
    console.error('创建订单失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// 创建订单（重定向版：返回 PayPal 审批链接，由前端跳转，不再用前端 SDK）
router.post('/create-redirect', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      email,
      country,
      region,
      address1,
      address2,
      postal_code,
      phone,
      currency = config.paypal.currency || 'USD',
      items
    } = req.body;

    const normalized = {
      email: email && String(email).trim(),
      country: country && String(country).trim(),
      region: region && String(region).trim(),
      address1: address1 && String(address1).trim(),
      address2: address2 && String(address2).trim(),
      postal_code: postal_code && String(postal_code).trim(),
      phone: phone && String(phone).trim(),
    };

    if (!normalized.email || !normalized.country || !normalized.region || !normalized.address1 || !normalized.phone || !normalized.postal_code || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: '缺少必要的订单信息或商品项。' });
    }

    // 拉取商品价格并计算总价
    const pricing = await buildOrderPricing(items, t);
    if (!pricing) {
      await t.rollback();
      return res.status(400).json({ message: '存在无效的商品ID。' });
    }

    const { rows: itemRows, totals, paypalItems } = pricing;
    const orderTotal = totals.total;

    // 创建本地订单（PENDING）——为兼容数据库非空约束，这里预先分配一个 order_no
    const preOrderNo2 = generateOrderNo();
    const order = await Order.create({
      order_no: preOrderNo2,
      email,
      country,
      region,
      address1,
      address2: normalized.address2 || null,
      postal_code: normalized.postal_code,
      phone: normalized.phone,
      currency,
      total_amount: formatCurrency(orderTotal),
      status: 'PENDING'
    }, { transaction: t });

    for (const row of itemRows) {
      await OrderItem.create({
        order_id: order.id,
        commodity_id: row.commodity.id,
        title_snapshot: row.commodity.title,
        unit_price: formatCurrency(row.unitPrice),
        quantity: row.quantity,
        line_total: formatCurrency(row.lineTotal)
      }, { transaction: t });
    }

    // 调用 PayPal 创建订单，获取审批链接
    const ppResp = await paypalCreateOrder({
      total: orderTotal,
      currency,
      returnUrl: config.paypal.returnUrl,
      cancelUrl: config.paypal.cancelUrl,
      brandName: config.paypal.brandName,
      purchaseUnit: buildPurchaseUnit({
        total: orderTotal,
        currency,
        items: paypalItems,
        shipping: totals.shippingTotal,
        discounts: totals.discountTotal,
        returnUrl: config.paypal.returnUrl,
        cancelUrl: config.paypal.cancelUrl,
      }),
    });
    const links = ppResp?.result?.links || [];
    const approve = links.find(l => l.rel === 'approve');
    const paypalOrderId = ppResp?.result?.id;
    if (!approve?.href || !paypalOrderId) {
      await t.rollback();
      return res.status(500).json({ message: '创建 PayPal 订单失败。' });
    }

    await order.update({ paypal_order_id: paypalOrderId }, { transaction: t });
    await t.commit();
    return res.status(200).json({ approvalUrl: approve.href });
  } catch (err) {
    await t.rollback();
    console.error('创建重定向订单失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// PayPal 同意后回跳
router.get('/return', async (req, res) => {
  try {
    const token = req.query.token; // PayPal Order ID
    if (!token) return res.status(400).send('缺少 token');
    const order = await Order.findOne({ where: { paypal_order_id: token } });
    if (!order) return res.status(404).send('未找到订单');

    const ppResp = await paypalCaptureOrder(token);
    const captureId = ppResp?.result?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const status = ppResp?.result?.status;
    const orderNo = order.order_no || generateOrderNo();

    await order.update({
      status: status === 'COMPLETED' ? 'PAID' : 'PAID',
      paypal_capture_id: captureId || null,
      order_no: orderNo
    });

    const target = `${config.frontend.baseUrl}/order-query?orderNo=${encodeURIComponent(orderNo)}`;
    return res.redirect(302, target);
  } catch (err) {
    console.error('回跳捕获失败:', err);
    return res.status(500).send('服务器内部错误');
  }
});

// 用户取消支付回跳
router.get('/cancel', async (req, res) => {
  try {
    const token = req.query.token; // PayPal Order ID
    if (token) {
      const order = await Order.findOne({ where: { paypal_order_id: token } });
      if (order) await order.update({ status: 'CANCELED' });
    }
    const target = `${config.frontend.baseUrl}/cart`;
    return res.redirect(302, target);
  } catch (err) {
    console.error('取消支付回跳失败:', err);
    return res.status(500).send('服务器内部错误');
  }
});

// 捕获支付（支付完成后调用）
router.post('/capture', async (req, res) => {
  try {
    const { paypalOrderId } = req.body;
    if (!paypalOrderId) {
      return res.status(400).json({ message: '缺少 paypalOrderId。' });
    }

    const order = await Order.findOne({ where: { paypal_order_id: paypalOrderId } });
    if (!order) {
      return res.status(404).json({ message: '未找到对应订单。' });
    }

    const ppResp = await paypalCaptureOrder(paypalOrderId);
    const captureId = ppResp?.result?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const status = ppResp?.result?.status;

    if (!captureId) {
      return res.status(500).json({ message: '捕获支付失败。' });
    }

    const orderNo = order.order_no || generateOrderNo();

    await order.update({
      status: status === 'COMPLETED' ? 'PAID' : 'PAID',
      paypal_capture_id: captureId,
      order_no: orderNo
    });

    // 邮件发送暂不实现（需求已说明手动发送）

    return res.status(200).json({ orderNo });
  } catch (err) {
    console.error('捕获支付失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// 公共查询（通过 orderNo + email）
router.get('/public', async (req, res) => {
  try {
    const { orderNo, email } = req.query;
    if (!orderNo || !email) {
      return res.status(400).json({ message: '缺少 orderNo 或 email。' });
    }

    const order = await Order.findOne({
      where: { order_no: orderNo, email },
      include: [{ model: OrderItem, as: 'items', attributes: ['commodity_id','title_snapshot','unit_price','quantity','line_total'] }]
    });

    if (!order) return res.status(404).json({ message: '未找到订单。' });

    return res.status(200).json({
      orderNo: order.order_no,
      status: order.status,
      currency: order.currency,
      total_amount: order.total_amount,
      created_at: order.created_at,
      items: order.items
    });
  } catch (err) {
    console.error('查询订单失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// 管理端：列出订单
router.get('/admin', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['id', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }]
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('列出订单失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// 管理端：更新订单状态
router.patch('/admin/:orderNo/status', verifyAdmin, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const { status } = req.body;
    const allow = ['CANCELED','FULFILLING','SHIPPED','COMPLETED'];
    if (!allow.includes(status)) {
      return res.status(400).json({ message: '非法的状态。' });
    }

    const order = await Order.findOne({ where: { order_no: orderNo } });
    if (!order) return res.status(404).json({ message: '未找到订单。' });

    await order.update({ status });
    return res.status(200).json({ message: '状态已更新。' });
  } catch (err) {
    console.error('更新订单状态失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

// 管理端：统计信息
router.get('/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const total = await Order.count();
    const pending = await Order.count({ where: { status: 'PENDING' } });
    const paid = await Order.count({ where: { status: 'PAID' } });
    const fulfilling = await Order.count({ where: { status: 'FULFILLING' } });
    const shipped = await Order.count({ where: { status: 'SHIPPED' } });
    const completed = await Order.count({ where: { status: 'COMPLETED' } });
    const canceled = await Order.count({ where: { status: 'CANCELED' } });
    return res.status(200).json({ total, pending, paid, fulfilling, shipped, completed, canceled });
  } catch (err) {
    console.error('获取订单统计失败:', err);
    return res.status(500).json({ message: '服务器内部错误.' });
  }
});

module.exports = router;
