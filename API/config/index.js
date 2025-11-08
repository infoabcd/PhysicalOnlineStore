const fs = require('fs');
const path = require('path');

function loadConfig() {
  const cfgPath = path.join(__dirname, 'config.json');
  let cfg = {};
  try {
    const raw = fs.readFileSync(cfgPath, 'utf-8');
    cfg = JSON.parse(raw);
  } catch (e) {
    cfg = {};
  }

  // 环境变量覆盖
  // 数据从 [.env] 读取，没有这个文件将从 [config.json] 读取
  cfg.paypal = cfg.paypal || {};
  cfg.paypal.clientId = process.env.PAYPAL_CLIENT_ID || cfg.paypal.clientId || '';
  cfg.paypal.clientSecret = process.env.PAYPAL_CLIENT_SECRET || cfg.paypal.clientSecret || '';
  cfg.paypal.env = process.env.PAYPAL_ENV || cfg.paypal.env || 'sandbox';
  cfg.paypal.currency = process.env.PAYPAL_CURRENCY || cfg.paypal.currency || 'USD';
  cfg.paypal.returnUrl = process.env.PAYPAL_RETURN_URL || cfg.paypal.returnUrl || '';
  cfg.paypal.cancelUrl = process.env.PAYPAL_CANCEL_URL || cfg.paypal.cancelUrl || '';
  cfg.paypal.brandName = process.env.PAYPAL_BRAND || cfg.paypal.brandName || 'ptp';

  cfg.frontend = cfg.frontend || {};
  cfg.frontend.baseUrl = process.env.FRONTEND_BASE_URL || cfg.frontend.baseUrl || 'http://localhost:5173';

  cfg.site = cfg.site || { title: 'ptp', subtitle: '' };

  return cfg;
}

module.exports = loadConfig();
