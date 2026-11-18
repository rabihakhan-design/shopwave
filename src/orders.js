// DummyJSON does not save new carts, so placed orders are also kept on this device
// so they still show up in the user's order history.
const KEY = 'sw_orders';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export const getOrders = (userId) => readAll()[userId] || [];

export function saveOrder(userId, order) {
  const all = readAll();
  all[userId] = [order, ...(all[userId] || [])].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(all));
}
