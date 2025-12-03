require('dotenv').config();

const read = (key, fallback = '') => process.env[key] || fallback;

const config = {
  paypal: {
    clientId: read('PAYPAL_CLIENT_ID'),
    clientSecret: read('PAYPAL_CLIENT_SECRET'),
    env: read('PAYPAL_ENV', 'sandbox'),
    currency: read('PAYPAL_CURRENCY', 'USD'),
    returnUrl: read('PAYPAL_RETURN_URL'),
    cancelUrl: read('PAYPAL_CANCEL_URL'),
    brandName: read('PAYPAL_BRAND', 'ptp'),
  },
  frontend: {
    baseUrl: read('FRONTEND_BASE_URL', 'http://localhost:5173'),
  },
  site: {
    title: read('SITE_TITLE', 'ptp'),
    subtitle: read('SITE_SUBTITLE', ''),
  },
};

module.exports = config;
