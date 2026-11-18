import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Stars from './Stars';

export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const oldPrice = p.price / (1 - p.discountPercentage / 100);
  return (
    <article className="card">
      <Link to={`/products/${p.id}`} className="card-img">
        <img src={p.thumbnail} alt={p.title} loading="lazy" />
        {p.discountPercentage > 0 && <span className="tag">-{Math.round(p.discountPercentage)}%</span>}
      </Link>
      <div className="card-body">
        <span className="muted cat">{p.category?.replace(/-/g, ' ')}</span>
        <h3><Link to={`/products/${p.id}`}>{p.title}</Link></h3>
        <Stars value={p.rating} />
        <div className="price-row">
          <strong>${p.price.toFixed(2)}</strong>
          {p.discountPercentage > 0 && <s className="muted">${oldPrice.toFixed(2)}</s>}
        </div>
        <button className="btn full" disabled={p.stock === 0} onClick={() => add(p)}>
          {p.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
