import { getMe, getUserCarts } from '../api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { EmptyState, ErrorState, Loader } from '../components/States';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../orders';

export default function Profile() {
  const { token, user, logout, withAuth } = useAuth();
  const navigate = useNavigate();
  const me = useFetch(() => withAuth(getMe), [token]);
  const carts = useFetch(() => getUserCarts(user.id), [user?.id]);
  const myOrders = getOrders(user?.id);

  if (me.loading) return <Loader label="Loading profile…" />;
  if (me.error) return (
    <ErrorState message={me.error} onRetry={me.reload} />
  );
  if (!me.data) return null;
  const u = me.data;
  const rows = [
    ['Username', u.username], ['Email', u.email], ['Phone', u.phone], ['Gender', u.gender],
    ['Birth date', u.birthDate], ['University', u.university],
    ['Address', u.address && `${u.address.address}, ${u.address.city}, ${u.address.state}, ${u.address.country}`],
    ['Company', u.company && `${u.company.title}, ${u.company.name}`],
  ];

  return (
    <>
      <div className="panel profile-head">
        <img src={u.image} alt="" />
        <div className="grow">
          <h1>{u.firstName} {u.lastName}</h1>
          <p className="muted">{u.email}</p>
        </div>
        <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Account details</h2>
          <dl className="dl">
            {rows.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
        </section>

        <section className="panel">
          <h2>Order history</h2>
          {myOrders.length > 0 && (
            <>
              <h3>Placed on this device</h3>
              {myOrders.map((o) => (
                <details key={o.id} className="order">
                  <summary>{new Date(o.date).toLocaleDateString()}: {o.totalQuantity} items, ${o.total.toFixed(2)}</summary>
                  <ul>
                    {o.items.map((p) => (
                      <li key={p.id}><img src={p.thumbnail} alt="" /><Link to={`/products/${p.id}`}>{p.title}</Link><span className="muted">× {p.quantity}</span></li>
                    ))}
                  </ul>
                </details>
              ))}
              <h3>Earlier orders (from API)</h3>
            </>
          )}
          {carts.loading ? <Loader /> : carts.error ? <ErrorState message={carts.error} onRetry={carts.reload} /> :
            carts.data.carts.length === 0 ? (myOrders.length > 0 ? <p className="muted">No earlier orders.</p> :
              <EmptyState title="No orders yet" text="Orders you place will appear here."><Link className="btn" to="/products">Start shopping</Link></EmptyState>) : carts.data.carts.map((c) => (
              <details key={c.id} className="order">
                <summary>Order #{c.id}: {c.totalQuantity} items, ${c.discountedTotal.toFixed(2)}</summary>
                <ul>
                  {c.products.map((p) => (
                    <li key={p.id}><img src={p.thumbnail} alt="" /><Link to={`/products/${p.id}`}>{p.title}</Link><span className="muted">× {p.quantity}</span></li>
                  ))}
                </ul>
              </details>
            ))}
        </section>
      </div>
    </>
  );
}
