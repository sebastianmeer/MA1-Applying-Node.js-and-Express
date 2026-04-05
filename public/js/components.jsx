/* ══════════════════════════════════════════════════════════════════════════════
   Shared Components — Header, UserMenu, ProductCard, Modals, FilterBar, etc.
   ══════════════════════════════════════════════════════════════════════════════ */

// ── UserMenu ──────────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout, onNavigate }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const isAdmin = user && user.role === 'admin';

    React.useEffect(() => {
        if (!open) return;
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [open]);

    const initials = (user.name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

    return (
        <div className="user-menu" ref={ref}>
            <button className="user-avatar" onClick={() => setOpen(p => !p)} title={user.name}>{initials}</button>
            {open && (
                <div className="user-dropdown">
                    <div className="user-dropdown__name">{user.name}</div>
                    <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
                    <hr className="user-dropdown__divider" />
                    {isAdmin && (
                        <button className="user-dropdown__link" onClick={() => { setOpen(false); onNavigate('#/admin'); }}>
                            Admin Dashboard
                        </button>
                    )}
                    <button className="user-dropdown__link" onClick={() => { setOpen(false); onNavigate('#/shop'); }}>
                        Shop
                    </button>
                    <hr className="user-dropdown__divider" />
                    <button className="btn btn--danger btn--sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setOpen(false); onLogout(); }}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Header ────────────────────────────────────────────────────────────────────
function AppHeader({ auth, onLogout, navigate, route, transparent }) {
    const isAdmin = auth.user && auth.user.role === 'admin';
    return (
        <header className={`header${transparent ? ' header--transparent' : ''}`}>
            <div className="layout">
                <div className="header__inner">
                    <a className="header__logo" onClick={() => navigate(auth.user ? '#/shop' : '#/')}>
                        <IconPackage /> Local <span>Marketplace</span>
                    </a>
                    <nav className="header__nav">
                        <button className={`header__nav-link${route === '#/shop' || route === '#/' && auth.user ? ' header__nav-link--active' : ''}`} onClick={() => navigate('#/shop')}>
                            Shop
                        </button>
                        {isAdmin && (
                            <button className={`header__nav-link${route === '#/admin' ? ' header__nav-link--active' : ''}`} onClick={() => navigate('#/admin')}>
                                Admin
                            </button>
                        )}
                    </nav>
                    <div className="header__actions">
                        {auth.user ? (
                            <UserMenu user={auth.user} onLogout={onLogout} onNavigate={navigate} />
                        ) : (
                            <button className={`btn ${transparent ? 'btn--outline-white' : 'btn--primary'}`} onClick={() => navigate('#/login')}>
                                Login / Register
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ── ProductCard (Shop Grid) ───────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
    const imgSrc = product.image || DEFAULT_IMG;
    return (
        <div className="product-card" onClick={() => onClick(product)}>
            <div className="product-card__img-wrap">
                <img className="product-card__img" src={imgSrc} alt={product.name} loading="lazy" />
                <div className="product-card__badge-overlay">
                    <span className={`badge ${badgeClass(product.category)}`}>{product.category}</span>
                </div>
            </div>
            <div className="product-card__header">
                <div className="product-card__name">{product.name}</div>
            </div>
            <div className="product-card__body">
                {product.description && <div className="product-card__desc">{product.description}</div>}
            </div>
            <div className="product-card__seller">
                <IconUser /> {product.seller}
            </div>
            <div className="product-card__footer">
                <div>
                    <span className="product-card__price">${product.price}</span>
                    {product.priceDiscount > 0 && <span className="product-card__discount">-${product.priceDiscount}</span>}
                </div>
                <div className="product-card__meta">
                    {product.rating && <span className="product-card__rating"><IconStar /> {product.rating}</span>}
                </div>
            </div>
        </div>
    );
}

// ── TableRow (Admin) ──────────────────────────────────────────────────────────
function TableRow({ product, selected, onToggle, onView, onEdit, onDelete }) {
    const imgSrc = product.image || DEFAULT_IMG;
    return (
        <tr>
            <td><input type="checkbox" className="checkbox" checked={selected} onChange={() => onToggle(product._id)} /></td>
            <td><img className="cell-img" src={imgSrc} alt="" /></td>
            <td>
                <div className="cell-name">{product.name}</div>
                {product.description && <div className="cell-desc">{product.description}</div>}
            </td>
            <td><span className={`badge ${badgeClass(product.category)}`}>{product.category}</span></td>
            <td className="cell-price">${product.price}</td>
            <td>{product.rating ? product.rating + ' / 5' : '—'}</td>
            <td>{product.seller}</td>
            <td>
                <div className="actions">
                    <button className="icon-btn icon-btn--view" onClick={() => onView(product)} title="View"><IconEye /></button>
                    <button className="icon-btn icon-btn--edit" onClick={() => onEdit(product)} title="Edit"><IconEdit /></button>
                    <button className="icon-btn icon-btn--delete" onClick={() => onDelete(product._id)} title="Delete"><IconTrash /></button>
                </div>
            </td>
        </tr>
    );
}

// ── DetailModal ───────────────────────────────────────────────────────────────
function DetailModal({ product, onClose, onEdit, onDelete, isAdmin }) {
    const imgSrc = product.image || DEFAULT_IMG;
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Product Details</h2>
                    <button className="modal__close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal__body">
                    <img className="detail-img" src={imgSrc} alt={product.name} />
                    <div className="detail-grid">
                        <div>
                            <div className="detail-label">Name</div>
                            <div className="detail-value">{product.name}</div>
                        </div>
                        <div>
                            <div className="detail-label">Category</div>
                            <div className="detail-value"><span className={`badge ${badgeClass(product.category)}`}>{product.category}</span></div>
                        </div>
                        <div>
                            <div className="detail-label">Seller</div>
                            <div className="detail-value">{product.seller}</div>
                        </div>
                        <div>
                            <div className="detail-label">Rating</div>
                            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ color: 'var(--warning)' }}><IconStar /></span> {product.rating} / 5
                            </div>
                        </div>
                    </div>
                    {product.description && (
                        <div style={{ marginTop: '1.6rem' }}>
                            <div className="detail-label">Description</div>
                            <div className="detail-value">{product.description}</div>
                        </div>
                    )}
                    <div className="detail-price">
                        <div className="detail-label">Price</div>
                        <div className="amount">${product.price}</div>
                        {product.priceDiscount > 0 && <div style={{ color: 'var(--success)', marginTop: '0.4rem', fontSize: '1.3rem' }}>Discount: ${product.priceDiscount}</div>}
                    </div>
                    {isAdmin && (
                        <div className="detail-actions">
                            <button className="btn btn--primary" onClick={() => { onClose(); onEdit(product); }}><IconEdit /> Edit</button>
                            <button className="btn btn--danger" onClick={() => { onClose(); onDelete(product._id); }}><IconTrash /> Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── FormModal (Admin CRUD) ────────────────────────────────────────────────────
function FormModal({ product, onClose, onSubmit }) {
    const [formData, setFormData] = React.useState(
        product || { name: '', price: '', category: 'Electronics', description: '', seller: '', rating: 4.5, priceDiscount: '', image: '' }
    );
    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleSubmit = e => {
        e.preventDefault();
        const payload = { ...formData };
        if (payload.price) payload.price = Number(payload.price);
        if (payload.rating) payload.rating = Number(payload.rating);
        if (payload.priceDiscount) payload.priceDiscount = Number(payload.priceDiscount);
        if (!payload.image) delete payload.image;
        onSubmit(payload);
    };
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{product ? 'Edit Product' : 'Add Product'}</h2>
                    <button className="modal__close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal__body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input className="form-input" type="number" value={formData.price} onChange={e => handleChange('price', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Seller</label>
                            <input className="form-input" type="text" value={formData.seller} onChange={e => handleChange('seller', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-input" type="text" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image URL (Cloudinary)</label>
                            <input className="form-input" type="url" placeholder="https://res.cloudinary.com/..." value={formData.image || ''} onChange={e => handleChange('image', e.target.value)} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <input className="form-input" type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={e => handleChange('rating', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount</label>
                                <input className="form-input" type="number" value={formData.priceDiscount} onChange={e => handleChange('priceDiscount', e.target.value)} />
                            </div>
                        </div>
                        <button className="btn btn--primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.6rem' }}>
                            {product ? 'Update Product' : 'Create Product'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── KpiCards ───────────────────────────────────────────────────────────────────
function KpiCards({ products }) {
    const stats = React.useMemo(() => {
        if (!products.length) return { total: 0, categories: 0, avgPrice: 0, latest: '—' };
        const cats = new Set(products.map(p => p.category));
        const avg = products.reduce((s, p) => s + (p.price || 0), 0) / products.length;
        const sorted = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return { total: products.length, categories: cats.size, avgPrice: avg.toFixed(0), latest: sorted[0]?.name || '—' };
    }, [products]);
    return (
        <div className="kpi-grid">
            <div className="kpi-card">
                <div className="kpi-card__icon kpi-card__icon--blue"><IconPackage /></div>
                <div className="kpi-card__info"><div className="kpi-card__label">Total Products</div><div className="kpi-card__value">{stats.total}</div></div>
            </div>
            <div className="kpi-card">
                <div className="kpi-card__icon kpi-card__icon--green"><IconTag /></div>
                <div className="kpi-card__info"><div className="kpi-card__label">Categories</div><div className="kpi-card__value">{stats.categories}</div></div>
            </div>
            <div className="kpi-card">
                <div className="kpi-card__icon kpi-card__icon--amber"><IconDollar /></div>
                <div className="kpi-card__info"><div className="kpi-card__label">Avg. Price</div><div className="kpi-card__value">${stats.avgPrice}</div></div>
            </div>
            <div className="kpi-card">
                <div className="kpi-card__icon kpi-card__icon--purple"><IconTrendUp /></div>
                <div className="kpi-card__info"><div className="kpi-card__label">Latest Added</div><div className="kpi-card__value" style={{ fontSize: '1.4rem' }}>{stats.latest}</div></div>
            </div>
        </div>
    );
}

// ── AdminBar ──────────────────────────────────────────────────────────────────
function AdminBar({ productCount, onAddProduct, showAnalytics, onToggleAnalytics }) {
    return (
        <div className="admin-bar">
            <div className="layout">
                <div className="admin-bar__inner">
                    <div className="admin-bar__left">
                        <div className="admin-bar__badge"><IconShield /> Admin Panel</div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                            {productCount} product{productCount !== 1 ? 's' : ''} in catalog
                        </span>
                    </div>
                    <div className="admin-bar__actions">
                        <button className={`admin-bar__btn${showAnalytics ? ' admin-bar__btn--active' : ''}`} onClick={onToggleAnalytics}>
                            <IconBarChart /> Analytics
                        </button>
                        <button className="admin-bar__btn" onClick={onAddProduct}>+ Add Product</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
