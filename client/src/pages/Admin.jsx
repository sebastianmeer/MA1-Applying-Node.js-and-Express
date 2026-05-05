import { useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm.jsx';
import { productApi } from '../lib/api';

export default function Admin({ user }) {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadProducts() {
    const body = await productApi.list('?sort=-postedDate');
    setProducts(body.data.products);
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      loadProducts().catch((err) => setError(err.message));
    }
  }, [user]);

  async function handleCreate(payload, form) {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await productApi.create(payload);
      form.reset();
      setMessage('Product created.');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    setMessage('');
    try {
      await productApi.remove(id);
      setMessage('Product deleted.');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (user?.role !== 'admin') {
    return (
      <section className="empty-state">
        <h2>Admin only</h2>
        <p>Your account can browse products, but product management requires an admin role.</p>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Product Management</h2>
        </div>
      </header>

      {message && <p className="success">{message}</p>}
      {error && <p className="alert">{error}</p>}

      <section className="panel">
        <h3>Create Product</h3>
        <ProductForm onSubmit={handleCreate} submitting={submitting} />
      </section>

      <section className="panel">
        <h3>Current Listings</h3>
        <div className="table-list">
          {products.map((product) => (
            <div className="table-row" key={product._id}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} / PHP {product.price}</span>
              </div>
              <button className="btn danger" type="button" onClick={() => handleDelete(product._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
