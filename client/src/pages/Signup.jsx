import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../lib/api';

export default function Signup({ onAuth }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const body = await authApi.signup(payload);
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
        <p className="eyebrow">Create Access</p>
        <h1>Start with a marketplace account.</h1>
        <p>Admin users can manage products. Normal users can browse products and manage their own account.</p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Signup</h2>
        {error && <p className="alert">{error}</p>}
        <label>
          <span>Name</span>
          <input name="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <label>
          <span>Role</span>
          <select name="role" defaultValue="user">
            <option value="user">Normal user</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" minLength="8" required />
        </label>
        <label>
          <span>Confirm Password</span>
          <input name="passwordConfirm" type="password" minLength="8" required />
        </label>
        <button className="btn primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </main>
  );
}
