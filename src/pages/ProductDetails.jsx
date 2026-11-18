import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import useFetch from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import Stars from '../components/Stars';
import { ErrorState, Loader } from '../components/States';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: p, loading, error, reload } = useFetch(() => getProduct(id), [id]);
  const { add } = useCart();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const related = useFetch(
    () => (p?.category ? getProducts({ category: p.category, limit: 5 }) : Promise.resolve(null)),
    [p?.category]
  );

  useEffect(() => { setImg(0); setQty(1); setAdded(false); }, [id]);
  useEffect(() => {
    if (p) document.title = `${p.title} | ShopWave`;
    return () => { document.title = 'ShopWave'; };
  }, [p]);

  if (loading) return <Loader label="Loading product…" />;
  if (error) return (
    <ErrorState message={error} onRetry={reload}>
      <Link className="btn ghost" to="/products">Back to products</Link>
    </ErrorState>
  );

  const images = p.images?.length ? p.images : [p.thumbnail];
  const oldPrice = p.price / (1 - p.discountPercentage / 100);

  return (
    <>
      <p className="crumbs"><Link to="/products">Products</Link> / <Link to={`/products?category=${p.category}`}>{p.category.replace(/-/g, ' ')}</Link> / {p.title}</p>
      <div className="details">
        <div>
          <div className="main-img"><img src={images[img]} alt={p.title} /></div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <button key={i} className={i === img ? 'active' : ''} onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`}><img src={src} alt="" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="info">
          <span className="muted cat">{p.brand ? `${p.brand} · ` : ''}{p.category.replace(/-/g, ' ')}</span>
          <h1>{p.title}</h1>
          <Stars value={p.rating} />
          <div className="price-row big-price">
            <strong>${p.price.toFixed(2)}</strong>
            {p.discountPercentage > 0 && <><s className="muted">${oldPrice.toFixed(2)}</s><span className="tag static">-{Math.round(p.discountPercentage)}%</span></>}
          </div>
          <p>{p.description}</p>
          <p className={p.stock > 0 ? 'ok' : 'err'}>{p.availabilityStatus || (p.stock > 0 ? 'In stock' : 'Out of stock')} ({p.stock} left)</p>
          <div className="row">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn" disabled={p.stock === 0} onClick={() => { add(p, qty); setAdded(true); }}>Add to cart</button>
            <button className="btn ghost" disabled={p.stock === 0} onClick={() => { add(p, qty); navigate('/cart'); }}>Buy now</button>
          </div>
          {added && <p className="ok" role="status">Added to cart. <Link to="/cart">View cart</Link></p>}
          <ul className="facts">
            {p.warrantyInformation && <li>{p.warrantyInformation}</li>}
            {p.shippingInformation && <li>{p.shippingInformation}</li>}
            {p.returnPolicy && <li>{p.returnPolicy}</li>}
          </ul>
        </div>
      </div>

      <section>
        <h2>Customer reviews ({p.reviews?.length || 0})</h2>
        {!p.reviews?.length ? <p className="muted">No reviews yet.</p> : (
          <div className="reviews">
            {p.reviews.map((r, i) => (
              <div className="review" key={i}>
                <Stars value={r.rating} />
                <p>{r.comment}</p>
                <small className="muted">{r.reviewerName}, {new Date(r.date).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.data?.products?.filter((x) => x.id !== p.id).length > 0 && (
        <section>
          <h2>You may also like</h2>
          <div className="grid">
            {related.data.products.filter((x) => x.id !== p.id).slice(0, 4).map((x) => <ProductCard key={x.id} product={x} />)}
          </div>
        </section>
      )}
    </>
  );
}
