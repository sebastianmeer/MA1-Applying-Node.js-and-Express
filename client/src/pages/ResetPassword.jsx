import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../lib/api';

export default function ResetPassword() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleForgot(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = await authApi.forgotPassword(Object.fromEntries(new FormData(event.currentTarget).entries()));
      setMessage(body.resetToken ? `Reset token: ${body.resetToken}` : body.message);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const token = payload.token;
    delete payload.token;
    try {
      await authApi.resetPassword(token, payload);
      setMessage('Password reset. You can login with the new password.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-screen reset-layout">
      <form className="auth-card" onSubmit={handleForgot}>
        <h2>Forgot Password</h2>
        <label>
          <span>Email</span>
          <input name="email" type="email" required />
        </label>
        <button className="btn primary">Send Reset Token</button>
      </form>

      <form className="auth-card" onSubmit={handleReset}>
        <h2>Reset Password</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        <label>
          <span>Token</span>
          <input name="token" required />
        </label>
        <label>
          <span>New Password</span>
          <input name="password" type="password" minLength="8" required />
        </label>
        <label>
          <span>Confirm Password</span>
          <input name="passwordConfirm" type="password" minLength="8" required />
        </label>
        <button className="btn primary">Reset Password</button>
        <Link to="/login">Back to login</Link>
      </form>
    </main>
  );
}
