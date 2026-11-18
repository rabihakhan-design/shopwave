import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const close = () => setOpen(false);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
    close();
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>ShopWave</Link>
        <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
        <div className={`nav-menu ${open ? 'open' : ''}`}>
          <form className="nav-search" onSubmit={submit} role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
            <button className="btn small">Search</button>
          </form>
          <nav className="nav-links">
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/products" onClick={close}>Products</NavLink>
            <NavLink to="/blog" onClick={close}>Blog</NavLink>
            <NavLink to="/contact" onClick={close}>Contact</NavLink>
            <NavLink to="/cart" onClick={close}>Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
            {user ? (
              <>
                <NavLink to="/profile" onClick={close} className="nav-user">
                  <img src={user.image} alt="" /> {user.firstName}
                </NavLink>
                <button className="btn ghost small" onClick={() => { logout(); close(); navigate('/'); }}>Log out</button>
              </>
            ) : (
              <NavLink to="/login" onClick={close}>Log in</NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
