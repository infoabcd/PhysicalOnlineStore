const KEY = 'cart_v1';

export function getCart() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (_) {
    return [];
  }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items || []));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}

export function countItems() {
  return getCart().reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
}

export function addItem(commodity_id, qty = 1, snapshot = {}) {
  const items = getCart();
  const id = Number(commodity_id);
  const q = Math.max(1, Number(qty) || 1);
  const idx = items.findIndex(it => Number(it.commodity_id) === id);
  if (idx >= 0) {
    items[idx].quantity = Math.max(1, Number(items[idx].quantity || 1) + q);
  } else {
    items.push({ commodity_id: id, quantity: q, ...snapshot });
  }
  setCart(items);
  return items;
}

export function updateQty(commodity_id, qty) {
  const items = getCart();
  const id = Number(commodity_id);
  const q = Math.max(1, Number(qty) || 1);
  const idx = items.findIndex(it => Number(it.commodity_id) === id);
  if (idx >= 0) {
    items[idx].quantity = q;
    setCart(items);
  }
  return items;
}

export function removeItem(commodity_id) {
  const id = Number(commodity_id);
  const items = getCart().filter(it => Number(it.commodity_id) !== id);
  setCart(items);
  return items;
}
