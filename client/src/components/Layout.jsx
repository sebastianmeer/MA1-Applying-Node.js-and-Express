import { NavLink, Outlet } from 'react-router-dom';

export default function Layout({ user, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">Marketplace</p>
            <h1>Local Market</h1>
          </div>
        </div>

        <nav className="nav-list">
          <NavLink to="/products">Products</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/profile">Account</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="eyebrow">Signed in as</p>
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button className="btn ghost" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
