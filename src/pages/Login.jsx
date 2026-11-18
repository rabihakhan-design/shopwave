import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getDemoUsers } from '../api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const demo = useFetch(() => getDemoUsers(6), []);
  const from = location.state?.from || '/profile';

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.username.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="panel" onSubmit={submit}>
        <h1>Log in</h1>
        <label htmlFor="username">Username</label>
        <input id="username" required autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>

      <div className="panel">
        <h2>Demo accounts</h2>
        <p className="muted">These users come from the API. Select one to fill the form.</p>
        {demo.loading ? <p className="muted">Loading accounts…</p> : demo.error ? (
          <p className="err">{demo.error} <button className="link" onClick={demo.reload}>Retry</button></p>
        ) : (
          <ul className="demo-list">
            {demo.data.users.map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => setForm({ username: u.username, password: u.password })}>
                  <img src={u.image} alt="" />
                  <span><strong>{u.firstName} {u.lastName}</strong><small className="muted">{u.username}</small></span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
