export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn ghost small" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      {start > 1 && <><button className="btn ghost small" onClick={() => onChange(1)}>1</button><span>…</span></>}
      {pages.map((n) => (
        <button key={n} className={`btn small ${n === page ? '' : 'ghost'}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>
      ))}
      {end < totalPages && <><span>…</span><button className="btn ghost small" onClick={() => onChange(totalPages)}>{totalPages}</button></>}
      <button className="btn ghost small" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}
