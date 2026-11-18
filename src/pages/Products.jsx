import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE, getCategories, getProducts } from '../api';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { EmptyState, ErrorState, Loader } from '../components/States';

const SORTS = [
  { label: 'Default', sortBy: '', order: 'asc' },
  { label: 'Title: A to Z', sortBy: 'title', order: 'asc' },
  { label: 'Title: Z to A', sortBy: 'title', order: 'desc' },
  { label: 'Price: low to high', sortBy: 'price', order: 'asc' },
  { label: 'Price: high to low', sortBy: 'price', order: 'desc' },
  { label: 'Rating: high to low', sortBy: 'rating', order: 'desc' },
  { label: 'Rating: low to high', sortBy: 'rating', order: 'asc' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sortBy = params.get('sortBy') || '';
  const order = params.get('order') || 'asc';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setText(q);
  }, [q]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '1', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const cats = useFetch(getCategories, []);
  const { data, loading, error, reload } = useFetch(
    () => getProducts({ q, category, sortBy, order, page }),
    [q, category, sortBy, order, page]
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const sortValue = SORTS.findIndex((s) => s.sortBy === sortBy && (!sortBy || s.order === order));
  const clearAll = () => setParams({});
  const hasFilters = q || category || sortBy;

  return (
    <>
      <h1>{q ? `Results for "${q}"` : category ? category.replace(/-/g, ' ') : 'All products'}{q && category ? ` in ${category.replace(/-/g, ' ')}` : ''}</h1>
      <div className="layout">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); update({ q: text.trim() }); }} role="search">
            <label htmlFor="search">Search</label>
            <div className="row tight">
              <input id="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search products" />
              <button className="btn small">Go</button>
            </div>
          </form>

          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sortValue < 0 ? 0 : sortValue} onChange={(e) => {
            const s = SORTS[Number(e.target.value)];
            update({ sortBy: s.sortBy, order: s.sortBy ? s.order : '' });
          }}>
            {SORTS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
          </select>

          <label htmlFor="category">Category</label>
          {cats.loading ? <small className="muted">Loading categories…</small> : cats.error ? (
            <small className="err">Could not load categories. <button className="link" onClick={cats.reload}>Retry</button></small>
          ) : (
            <select id="category" value={category} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All categories</option>
              {cats.data.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          )}
          {hasFilters && <button className="btn ghost full" onClick={clearAll}>Clear all filters</button>}
        </aside>

        <section>
          <div className="toolbar">
            <button className="btn ghost small filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide filters' : 'Show filters'}
            </button>
            {data && <span className="muted">{data.total} product{data.total === 1 ? '' : 's'}</span>}
          </div>
          {loading ? <Loader label="Loading products…" /> : error ? <ErrorState message={error} onRetry={reload} /> :
            data.products.length === 0 ? (
              <EmptyState title="No products found" text="Try a different search term or category.">
                <button className="btn" onClick={clearAll}>Show all products</button>
              </EmptyState>
            ) : (
              <>
                <div className="grid">{data.products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                <Pagination page={page} totalPages={totalPages} onChange={(n) => { update({ page: String(n) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
        </section>
      </div>
    </>
  );
}
