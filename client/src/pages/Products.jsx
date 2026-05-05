import { useEffect, useMemo, useState } from 'react';
import { productApi } from '../lib/api';
import ProductModal from '../components/ProductModal.jsx';

const categories = ['', 'Electronics', 'Clothes', 'Books', 'Food', 'Home', 'Services', 'Sports', 'Others'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ category: '', sort: '-postedDate' });
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    return params.toString() ? `?${params.toString()}` : '';
  }, [filters]);

  useEffect(() => {
    setError('');
    Promise.all([productApi.list(query), productApi.stats()])
      .then(([productBody, statsBody]) => {
        setProducts(productBody.data.products);
        setStats(statsBody.data.stats);
      })
      .catch((err) => setError(err.message));
  }, [query]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Browse</p>
          <h2>Marketplace Products</h2>
        </div>
        <div className="toolbar">
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
            {categories.map((category) => (
              <option key={category || 'all'} value={category}>
                {category || 'All categories'}
              </option>
            ))}
          </select>
          <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
            <option value="-postedDate">Newest</option>
            <option value="price">Lowest price</option>
            <option value="-price">Highest price</option>
            <option value="name">Name</option>
          </select>
        </div>
      </header>

      {error && <p className="alert">{error}</p>}

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.category}>
            <span>{item.category}</span>
            <strong>{item.numProducts}</strong>
            <small>Avg PHP {item.avgPrice}</small>
          </article>
        ))}
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div>
              <p className="eyebrow">{product.category}</p>
              <h3>{product.name}</h3>
              <p>{product.description || 'No description.'}</p>
            </div>
            <div className="card-meta">
              <span>PHP {product.price}</span>
              <span>{product.seller}</span>
            </div>
            <button className="btn ghost" type="button" onClick={() => setSelected(product)}>
              View Details
            </button>
          </article>
        ))}
      </section>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
