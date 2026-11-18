import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sw_cart')) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('sw_cart', JSON.stringify(items));
  }, [items]);

  const add = (p, qty = 1) =>
    setItems((cur) => {
      const max = p.stock ?? 99;
      const found = cur.find((i) => i.id === p.id);
      if (found) return cur.map((i) => (i.id === p.id ? { ...i, quantity: Math.min(i.quantity + qty, max) } : i));
      return [...cur, { id: p.id, title: p.title, price: p.price, thumbnail: p.thumbnail, stock: max, quantity: Math.min(qty, max) }];
    });
  const setQty = (id, quantity) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items, add, setQty, remove, clear,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.quantity * i.price, 0),
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
