import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBlogUsers, getPosts } from '../api';
import useFetch from '../hooks/useFetch';
import Pagination from '../components/Pagination';
import { EmptyState, ErrorState, Loader } from '../components/States';

const PER_PAGE = 9;

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const userId = params.get('userId') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);

  const posts = useFetch(getPosts, []);
  const users = useFetch(getBlogUsers, []);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const nameOf = useMemo(() => Object.fromEntries((users.data || []).map((u) => [u.id, u.name])), [users.data]);
  const filtered = useMemo(
    () =>
      (posts.data || []).filter(
        (p) => (!userId || String(p.userId) === userId) && (!q || p.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [posts.data, q, userId]
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <h1>ShopWave Blog</h1>
      <p className="muted">Shopping tips and stories from our community (posts from JSONPlaceholder).</p>
      <form className="row tight" onSubmit={(e) => { e.preventDefault(); update({ q: text.trim() }); }} role="search">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search posts" aria-label="Search posts" />
        <select aria-label="Filter by author" value={userId} onChange={(e) => update({ userId: e.target.value })}>
          <option value="">All authors</option>
          {(users.data || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button className="btn small">Search</button>
        {(q || userId) && <button type="button" className="btn ghost small" onClick={() => { setText(''); setParams({}); }}>Clear</button>}
      </form>

      {posts.loading ? <Loader label="Loading posts…" /> : posts.error ? <ErrorState message={posts.error} onRetry={posts.reload} /> :
        shown.length === 0 ? <EmptyState title="No posts found" text="Try a different search or author." /> : (
          <>
            <p className="muted">{filtered.length} post{filtered.length === 1 ? '' : 's'}</p>
            <div className="grid">
              {shown.map((p) => (
                <article className="card" key={p.id}>
                  <div className="card-body">
                    <span className="muted cat">{nameOf[p.userId] || `Author ${p.userId}`}</span>
                    <h3><Link to={`/blog/${p.id}`}>{p.title}</Link></h3>
                    <p className="muted">{p.body.replace(/\n/g, ' ').slice(0, 90)}…</p>
                    <Link className="btn ghost full" to={`/blog/${p.id}`}>Read more</Link>
                  </div>
                </article>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={(n) => { update({ page: String(n) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
    </>
  );
}
