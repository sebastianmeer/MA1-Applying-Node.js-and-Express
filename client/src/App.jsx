import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi, getToken, setToken } from './lib/api';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Products from './pages/Products.jsx';
import Admin from './pages/Admin.jsx';
import Profile from './pages/Profile.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

function ProtectedRoute({ user, children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (!user) return <div className="screen-note">Loading account...</div>;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) return;

    authApi
      .me()
      .then((body) => setUser(body.data.user))
      .catch(() => {
        setToken('');
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  function handleAuth(body) {
    setToken(body.token);
    setUser(body.user || body.data?.user);
    navigate('/products');
  }

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    setToken('');
    setUser(null);
    navigate('/login');
  }

  if (booting) return <div className="screen-note">Starting marketplace...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login onAuth={handleAuth} />} />
      <Route path="/signup" element={<Signup onAuth={handleAuth} />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<Products user={user} />} />
        <Route path="admin" element={<Admin user={user} />} />
        <Route path="profile" element={<Profile user={user} setUser={setUser} onLogout={handleLogout} />} />
      </Route>
      <Route path="*" element={<Navigate to={getToken() ? '/products' : '/login'} replace />} />
    </Routes>
  );
}
