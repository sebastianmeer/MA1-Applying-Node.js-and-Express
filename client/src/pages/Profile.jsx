import { useState } from 'react';
import { authApi, setToken } from '../lib/api';

export default function Profile({ user, setUser, onLogout }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleDetails(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = await authApi.updateMe(Object.fromEntries(new FormData(event.currentTarget).entries()));
      setUser(body.data.user);
      setMessage('Account details updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = await authApi.updatePassword(Object.fromEntries(new FormData(event.currentTarget).entries()));
      if (body.token) setToken(body.token);
      setMessage('Password updated.');
      event.currentTarget.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    setError('');
    try {
      await authApi.deleteMe();
      await onLogout();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h2>{user?.name}</h2>
        </div>
      </header>

      {message && <p className="success">{message}</p>}
      {error && <p className="alert">{error}</p>}

      <section className="settings-grid">
        <form className="panel form-stack" onSubmit={handleDetails}>
          <h3>Profile Details</h3>
          <label>
            <span>Name</span>
            <input name="name" defaultValue={user?.name || ''} required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" defaultValue={user?.email || ''} required />
          </label>
          <label>
            <span>Photo</span>
            <input name="photo" defaultValue={user?.photo || ''} />
          </label>
          <button className="btn primary">Save Details</button>
        </form>

        <form className="panel form-stack" onSubmit={handlePassword}>
          <h3>Update Password</h3>
          <label>
            <span>Current Password</span>
            <input name="passwordCurrent" type="password" minLength="8" required />
          </label>
          <label>
            <span>New Password</span>
            <input name="password" type="password" minLength="8" required />
          </label>
          <label>
            <span>Confirm Password</span>
            <input name="passwordConfirm" type="password" minLength="8" required />
          </label>
          <button className="btn primary">Update Password</button>
        </form>
      </section>

      <section className="panel danger-zone">
        <div>
          <h3>Delete Account</h3>
          <p>This marks your account inactive and signs you out.</p>
        </div>
        <button className="btn danger" type="button" onClick={handleDelete}>
          Delete My Account
        </button>
      </section>
    </div>
  );
}
