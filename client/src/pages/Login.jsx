import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../lib/api';

export default function Login({ onAuth }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const body = await authApi.login(Object.fromEntries(form.entries()));
      onAuth(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-copy">
        <p className="eyebrow">Local Marketplace</p>
        <h1>Manage marketplace products with real account access.</h1>
        <p>
          Browse products, inspect category aggregation, and manage listings with role-based admin controls.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="alert">{error}</p>}
        <label>
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" minLength="8" required />
        </label>
        <button className="btn primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="auth-links">
          <Link to="/signup">Create account</Link>
          <Link to="/reset-password">Forgot password</Link>
        </div>
      </form>
    </main>
  );
}
