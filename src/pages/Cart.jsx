import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitCart } from '../api';
import { saveOrder } from '../orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/States';

export default function Cart() {
  const { items, setQty, remove, clear, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const checkout = async () => {
    if (!user) return navigate('/login', { state: { from: '/cart' } });
    setBusy(true);
    setError('');
    try {
      const res = await submitCart(user.id, items.map((i) => ({ id: i.id, quantity: i.quantity })));
      saveOrder(user.id, {
        id: `local-${Date.now()}`,
        date: new Date().toISOString(),
        items: items.map(({ id, title, thumbnail, price, quantity }) => ({ id, title, thumbnail, price, quantity })),
        totalQuantity: res.totalQuantity,
        total: res.discountedTotal ?? total,
      });
      setDone(res);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) return (
    <EmptyState title="Order placed" text={`Your order of ${done.totalQuantity} item(s) totalling $${done.discountedTotal.toFixed(2)} was accepted by the API.`}>
      <Link className="btn" to="/profile">View my orders</Link>
      <Link className="btn ghost" to="/products">Continue shopping</Link>
    </EmptyState>
  );
  if (!items.length) return (
    <EmptyState title="Your cart is empty" text="Add some products and they will show up here.">
      <Link className="btn" to="/products">Browse products</Link>
    </EmptyState>
  );

  return (
    <>
      <h1>Your cart ({count})</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <Link to={`/products/${i.id}`}><img src={i.thumbnail} alt={i.title} /></Link>
              <div className="grow">
                <Link to={`/products/${i.id}`}><strong>{i.title}</strong></Link>
                <div className="muted">${i.price.toFixed(2)} each</div>
                <button className="link err" onClick={() => remove(i.id)}>Remove</button>
              </div>
              <div className="qty">
                <button onClick={() => setQty(i.id, i.quantity - 1)} disabled={i.quantity <= 1} aria-label="Decrease quantity">−</button>
                <span>{i.quantity}</span>
                <button onClick={() => setQty(i.id, i.quantity + 1)} disabled={i.quantity >= i.stock} aria-label="Increase quantity">+</button>
              </div>
              <strong className="line-total">${(i.price * i.quantity).toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <aside className="panel summary">
          <h2>Summary</h2>
          <div className="row between"><span>Items</span><span>{count}</span></div>
          <div className="row between"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn full" onClick={checkout} disabled={busy}>
            {busy ? 'Placing order…' : user ? 'Place order' : 'Log in to check out'}
          </button>
          <button className="btn ghost full" onClick={clear}>Clear cart</button>
        </aside>
      </div>
    </>
  );
}
