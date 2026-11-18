import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../api';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { ErrorState, Loader } from '../components/States';

export default function Home() {
  const cats = useFetch(getCategories, []);
  const top = useFetch(() => getProducts({ sortBy: 'rating', order: 'desc', limit: 8 }), []);
  const hero = top.data?.products?.[0];

  return (
    <>
      <section className="hero">
        <div>
          <h1>Everything you need, delivered to your door.</h1>
          <p>Browse {top.data ? `${top.data.total}+` : 'hundreds of'} products across every category, from groceries to laptops, with live stock and prices.</p>
          <div className="row">
            <Link className="btn big" to="/products">Shop all products</Link>
            <Link className="btn big ghost" to="/login">Log in</Link>
          </div>
        </div>
        {hero && (
          <Link to={`/products/${hero.id}`} className="hero-card">
            <img src={hero.thumbnail} alt={hero.title} />
            <span>Top rated: {hero.title}</span>
          </Link>
        )}
      </section>

      <section>
        <h2>Shop by category</h2>
        {cats.loading ? <Loader /> : cats.error ? <ErrorState message={cats.error} onRetry={cats.reload} /> : (
          <div className="chips">
            {cats.data.map((c) => (
              <Link key={c.slug} className="chip" to={`/products?category=${c.slug}`}>{c.name}</Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Top rated products</h2>
          <Link to="/products?sortBy=rating&order=desc">View all</Link>
        </div>
        {top.loading ? <Loader /> : top.error ? <ErrorState message={top.error} onRetry={top.reload} /> : (
          <div className="grid">{top.data.products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
    </>
  );
}
