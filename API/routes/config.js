const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/verify');

router.get('/paypal-client-id', (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'sandbox_client_id_placeholder';
  return res.status(200).json({ clientId });
});

// 获取当前 PayPal 配置（管理员）
router.get('/paypal', verifyAdmin, (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  const hasSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET);
  return res.status(200).json({ clientId, env, hasSecret });
});

// 设置 PayPal 配置（管理员） - 运行时生效
router.post('/paypal', verifyAdmin, (req, res) => {
  const { clientId, clientSecret, env } = req.body || {};
  if (!clientId || !clientSecret || !env) {
    return res.status(400).json({ message: '缺少 clientId/clientSecret/env' });
  }
  process.env.PAYPAL_CLIENT_ID = clientId;
  process.env.PAYPAL_CLIENT_SECRET = clientSecret;
  process.env.PAYPAL_ENV = env;
  return res.status(200).json({ message: 'PayPal 配置已更新（本次运行有效）' });
});

module.exports = router;
