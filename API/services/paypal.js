const paypal = require('@paypal/checkout-server-sdk');
const config = require('../config');

function environment() {
  const clientId = config.paypal.clientId || 'sandbox_client_id_placeholder';
  const clientSecret = config.paypal.clientSecret || 'sandbox_secret_placeholder';
  const env = (config.paypal.env || 'sandbox').toLowerCase();
  if (env === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

function buildPurchaseUnit({
  total,
  currency,
  items = [],
  shipping = 0,
  discounts = 0,
}) {
  const amountValue = Number(total).toFixed(2);
  const breakdown = {
    item_total: {
      currency_code: currency,
      value: Number(total - shipping + discounts).toFixed(2),
    },
  };

  if (shipping) {
    breakdown.shipping = {
      currency_code: currency,
      value: Number(shipping).toFixed(2),
    };
  }

  if (discounts) {
    breakdown.discount = {
      currency_code: currency,
      value: Number(discounts).toFixed(2),
    };
  }

  return {
    amount: {
      currency_code: currency,
      value: amountValue,
      breakdown,
    },
    items: items.map((item) => ({
      name: item.title.slice(0, 127),
      unit_amount: {
        currency_code: currency,
        value: Number(item.unit).toFixed(2),
      },
      quantity: String(item.quantity),
    })),
  };
}

async function createOrder({ total, currency, returnUrl, cancelUrl, brandName, purchaseUnit }) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      purchaseUnit || buildPurchaseUnit({
        total: total,
        currency: currency || config.paypal.currency || 'USD',
      }),
    ],
    application_context: {
      return_url: returnUrl || config.paypal.returnUrl,
      cancel_url: cancelUrl || config.paypal.cancelUrl,
      brand_name: brandName || config.paypal.brandName || 'RcClub',
      user_action: 'PAY_NOW'
    }
  });

  const response = await client().execute(request);
  return response; // contains result.id (orderID)
}

async function captureOrder(orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await client().execute(request);
  return response; // contains capture id, status
}

module.exports = { createOrder, captureOrder, buildPurchaseUnit };
