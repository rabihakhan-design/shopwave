import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendMessage } from '../api';
import { EmptyState } from '../components/States';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSent(await sendMessage({ title: `Message from ${form.name} (${form.email})`, body: form.message, userId: 1 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) return (
    <EmptyState title="Message sent" text={`Thanks ${form.name}! Your message reference is #${sent.id}.`}>
      <Link className="btn" to="/">Back to home</Link>
    </EmptyState>
  );

  return (
    <div className="auth">
      <form className="panel" onSubmit={submit}>
        <h1>Contact us</h1>
        <label htmlFor="m-name">Name</label>
        <input id="m-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label htmlFor="m-email">Email</label>
        <input id="m-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="m-msg">Message</label>
        <textarea id="m-msg" rows="5" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      </form>
    </div>
  );
}
