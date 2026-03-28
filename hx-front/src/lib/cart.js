const CART_KEY = 'hx-cart';

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('hx-cart-change'));
};

export function getCart() {
  return readCart();
}

export function setCart(items) {
  const next = Array.isArray(items) ? items : [];
  writeCart(next);
}

export function addItem(commodityId, qty, meta = {}) {
  const id = Number(commodityId);
  const q = Math.max(1, Number(qty) || 1);
  const cart = readCart();
  const idx = cart.findIndex((it) => Number(it.commodity_id) === id);
  let next;
  if (idx >= 0) {
    next = [...cart];
    next[idx] = {
      ...next[idx],
      ...meta,
      commodity_id: id,
      quantity: Math.max(1, Number(next[idx].quantity || 1) + q),
    };
  } else {
    next = [...cart, { commodity_id: id, quantity: q, ...meta }];
  }
  writeCart(next);
  return next;
}

export function updateQty(commodityId, quantity) {
  const id = Number(commodityId);
  const q = Math.max(1, Number(quantity) || 1);
  const next = readCart().map((it) =>
    Number(it.commodity_id) === id ? { ...it, quantity: q } : it,
  );
  writeCart(next);
  return next;
}

export function removeItem(commodityId) {
  const id = Number(commodityId);
  const next = readCart().filter((it) => Number(it.commodity_id) !== id);
  writeCart(next);
  return next;
}

export function clearCart() {
  writeCart([]);
}

export function countItems() {
  return readCart().reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
}
