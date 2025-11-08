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

async function createOrder({ total, currency, returnUrl, cancelUrl, brandName }) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency || config.paypal.currency || 'USD',
          value: String(Number(total).toFixed(2))
        }
      }
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

module.exports = { createOrder, captureOrder };
