import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addComment, getBlogUser, getPost, getPostComments } from '../api';
import useFetch from '../hooks/useFetch';
import { ErrorState, Loader } from '../components/States';

export default function BlogPost() {
  const { id } = useParams();
  const post = useFetch(() => getPost(id), [id]);
  const author = useFetch(() => (post.data ? getBlogUser(post.data.userId) : Promise.resolve(null)), [post.data?.userId]);
  const comments = useFetch(() => getPostComments(id), [id]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setMine([]); }, [id]);
  useEffect(() => {
    if (post.data) document.title = `${post.data.title} | ShopWave`;
    return () => { document.title = 'ShopWave'; };
  }, [post.data]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await addComment({ postId: Number(id), ...form });
      setMine((m) => [{ ...res, name: form.name, email: form.email, body: form.body }, ...m]);
      setForm({ name: '', email: '', body: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (post.loading) return <Loader label="Loading post…" />;
  if (post.error) return <ErrorState message={post.error} onRetry={post.reload}><Link className="btn ghost" to="/blog">Back to blog</Link></ErrorState>;
  const p = post.data;
  const all = [...mine, ...(comments.data || [])];

  return (
    <>
      <p className="crumbs"><Link to="/blog">Blog</Link> / Post {p.id}</p>
      <article className="panel">
        <h1>{p.title}</h1>
        <p className="muted">By {author.data ? <Link to={`/blog?userId=${author.data.id}`}>{author.data.name}</Link> : '…'}</p>
        <p style={{ whiteSpace: 'pre-line' }}>{p.body}</p>
      </article>

      <section>
        <h2>Comments ({all.length})</h2>
        {comments.loading ? <Loader /> : comments.error ? <ErrorState message={comments.error} onRetry={comments.reload} /> : (
          <div className="reviews">
            {all.map((c) => (
              <div className="review" key={c.id}>
                <strong>{c.name}</strong>
                <p>{c.body}</p>
                <small className="muted">{c.email}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <form className="panel" onSubmit={submit}>
        <h2>Leave a comment</h2>
        <label htmlFor="c-name">Name</label>
        <input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label htmlFor="c-email">Email</label>
        <input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="c-body">Comment</label>
        <textarea id="c-body" rows="4" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post comment'}</button>
        <small className="muted">The API fakes saving, so your comment shows only until you leave this page.</small>
      </form>
    </>
  );
}
