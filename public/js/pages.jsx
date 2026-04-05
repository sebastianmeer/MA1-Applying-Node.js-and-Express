/* ══════════════════════════════════════════════════════════════════════════════
   Pages — Landing, Login, Shop, Admin
   ══════════════════════════════════════════════════════════════════════════════ */

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ navigate, auth, onLogout }) {
    const [categoryCounts, setCategoryCounts] = React.useState({});
    React.useEffect(() => {
        fetch(API).then(r => r.json()).then(json => {
            if (json.status === 'success') {
                const counts = {};
                (json.data?.products || []).forEach(p => {
                    counts[p.category] = (counts[p.category] || 0) + 1;
                });
                setCategoryCounts(counts);
            }
        }).catch(() => {});
    }, []);
    return (
        <div>
            <AppHeader auth={auth} navigate={navigate} route="#/" transparent onLogout={onLogout} />
            {/* Hero */}
            <section className="landing-hero">
                <div className="layout">
                    <div className="landing-hero__content">
                        <div className="landing-hero__tag"><IconMapPin /> Your local community marketplace</div>
                        <h1 className="landing-hero__title">Discover <span>Local Treasures</span></h1>
                        <p className="landing-hero__desc">
                            Browse unique products from sellers in your neighborhood. From handcrafted goods to electronics — find great deals and support local.
                        </p>
                        <div className="landing-hero__actions">
                            <button className="btn btn--primary btn--lg" onClick={() => navigate('#/shop')}>
                                Browse Shop <IconArrowRight />
                            </button>
                            <button className="btn btn--outline-white btn--lg" onClick={() => navigate('#/login')}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="landing-section">
                <div className="layout">
                    <h2 className="landing-section__title text-center">Shop by Category</h2>
                    <p className="landing-section__sub text-center">Explore our curated collection across all categories</p>
                    <div className="category-grid">
                        {CATEGORIES.map(cat => (
                            <div key={cat} className="category-card" onClick={() => navigate('#/shop?category=' + encodeURIComponent(cat))}>
                                <div className={`category-card__icon ${categoryIconClass(cat)}`}>
                                    {CATEGORY_ICONS[cat] || '📦'}
                                </div>
                                <div className="category-card__name">{cat}</div>
                                <div className="category-card__count">{categoryCounts[cat] || 0} products</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="landing-section" style={{ background: 'var(--surface)' }}>
                <div className="layout">
                    <h2 className="landing-section__title text-center">How It Works</h2>
                    <p className="landing-section__sub text-center">Get started in three simple steps</p>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-card__number">1</div>
                            <h3 className="step-card__title">Browse Products</h3>
                            <p className="step-card__desc">Explore a wide range of products from local sellers. Filter by category, search by name, and sort by price or rating.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-card__number">2</div>
                            <h3 className="step-card__title">Connect with Sellers</h3>
                            <p className="step-card__desc">Find the perfect item and connect directly with the seller. Get the best deals from your community.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-card__number">3</div>
                            <h3 className="step-card__title">Enjoy Local Finds</h3>
                            <p className="step-card__desc">Pick up locally or arrange delivery. Support your community while discovering unique products.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="landing-section">
                <div className="layout">
                    <div className="cta-banner">
                        <h2 className="cta-banner__title">Ready to explore?</h2>
                        <p className="cta-banner__desc">Join our growing community of local buyers and sellers. Start browsing or create your account today.</p>
                        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn--lg" style={{ background: 'white', color: 'var(--primary)' }} onClick={() => navigate('#/shop')}>
                                Browse Shop
                            </button>
                            <button className="btn btn--outline-white btn--lg" onClick={() => navigate('#/login')}>
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="layout">© 2026 Local Marketplace. All rights reserved.</div>
            </footer>
        </div>
    );
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ navigate, auth }) {
    const [mode, setMode] = React.useState('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [role, setRole] = React.useState('user');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = mode === 'login' ? { email, password } : { name, email, password, role };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.message || 'Something went wrong');
                setLoading(false);
                return;
            }
            auth.login(json.token, json.user);
            // Redirect based on role
            if (json.user.role === 'admin') {
                navigate('#/admin');
            } else {
                navigate('#/shop');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__brand">
                <div className="login-page__brand-logo">
                    <IconPackage /> Local <span>Marketplace</span>
                </div>
                <h1 className="login-page__brand-title">Your neighborhood marketplace for unique finds</h1>
                <p className="login-page__brand-desc">
                    Connect with local sellers, discover one-of-a-kind products, and support your community — all in one place.
                </p>
                <ul className="login-page__features">
                    <li><IconCheck /> Browse products from local sellers</li>
                    <li><IconCheck /> Secure authentication & role-based access</li>
                    <li><IconCheck /> Admin dashboard for product management</li>
                    <li><IconCheck /> Real-time search, filter & sort</li>
                </ul>
            </div>
            <div className="login-page__form-side">
                <div className="login-page__form-wrap">
                    <h2 className="login-page__title">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
                    <p className="login-page__sub">{mode === 'login' ? 'Sign in to your account to continue' : 'Register to start browsing and selling'}</p>
                    <div className="login-page__tabs">
                        <button className={`login-page__tab${mode === 'login' ? ' login-page__tab--active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Login</button>
                        <button className={`login-page__tab${mode === 'register' ? ' login-page__tab--active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Register</button>
                    </div>
                    {error && <div className="login-page__error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                        </div>
                        {mode === 'register' && (
                            <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="user">User — Browse & Buy</option>
                                    <option value="admin">Admin — Manage Products</option>
                                </select>
                            </div>
                        )}
                        <button className="btn btn--primary btn--lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.6rem' }}>
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                    <button className="login-page__back" onClick={() => navigate('#/')}>
                        <IconArrowLeft /> Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Shop Page (User) ──────────────────────────────────────────────────────────
function ShopPage({ navigate, auth, onLogout, toastRef }) {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [sortBy, setSortBy] = React.useState('');
    const [detailProduct, setDetailProduct] = React.useState(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    // Parse category from hash (e.g. #/shop?category=Electronics)
    React.useEffect(() => {
        const hash = window.location.hash;
        const match = hash.match(/category=([^&]+)/);
        if (match) setCategoryFilter(decodeURIComponent(match[1]));
    }, []);

    const fetchProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = [];
            if (categoryFilter) params.push('category=' + categoryFilter);
            if (sortBy) params.push('sort=' + sortBy);
            if (debouncedSearch) params.push('name=' + debouncedSearch);
            const qs = params.length ? '?' + params.join('&') : '';
            const res = await fetch(API + qs);
            const json = await res.json();
            if (json.status === 'success') {
                setProducts(json.data?.products || []);
            }
        } catch (err) {
            toastRef.current('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, sortBy, debouncedSearch]);

    React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filteredProducts = products;
    return (
        <div>
            <AppHeader auth={auth} navigate={navigate} route="#/shop" onLogout={onLogout} />
            <div className="layout">
                {/* Category Chips */}
                <div className="category-chips" style={{ marginTop: '1.8rem' }}>
                    <button className={`chip${!categoryFilter ? ' chip--active' : ''}`} onClick={() => setCategoryFilter('')}>All</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} className={`chip${categoryFilter === cat ? ' chip--active' : ''}`} onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}>
                            {CATEGORY_ICONS[cat] || ''} {cat}
                        </button>
                    ))}
                </div>
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-bar__search">
                        <span className="filter-bar__search-icon"><IconSearch /></span>
                        <input className="filter-bar__search-input" type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-bar__controls">
                        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <span className="filter-bar__count">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                {/* Products */}
                {loading ? (
                    <div className="empty"><div className="spinner"></div><p className="mt-2">Loading products...</p></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty">
                        <div className="empty__icon"><IconPackage /></div>
                        <div className="empty__text">No products found</div>
                        <div className="empty__sub">Try adjusting your search or filter</div>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map(p => <ProductCard key={p._id} product={p} onClick={setDetailProduct} />)}
                    </div>
                )}
            </div>
            {detailProduct && <DetailModal product={detailProduct} onClose={() => setDetailProduct(null)} isAdmin={false} />}
            <footer className="footer"><div className="layout">© 2026 Local Marketplace. All rights reserved.</div></footer>
        </div>
    );
}

// ── Admin Page ────────────────────────────────────────────────────────────────
function AdminPage({ navigate, auth, onLogout, toastRef }) {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [sortBy, setSortBy] = React.useState('');
    const [showAnalytics, setShowAnalytics] = React.useState(false);
    const [statsData, setStatsData] = React.useState([]);
    const [selected, setSelected] = React.useState([]);
    const [detailProduct, setDetailProduct] = React.useState(null);
    const [editProduct, setEditProduct] = React.useState(null);
    const [showAddModal, setShowAddModal] = React.useState(false);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const fetchProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = [];
            if (categoryFilter) params.push('category=' + categoryFilter);
            if (sortBy) params.push('sort=' + sortBy);
            if (debouncedSearch) params.push('name=' + debouncedSearch);
            const qs = params.length ? '?' + params.join('&') : '';
            const res = await fetch(API + qs);
            const json = await res.json();
            if (json.status === 'success') setProducts(json.data?.products || []);
        } catch (err) {
            toastRef.current('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, sortBy, debouncedSearch]);

    const fetchAnalytics = React.useCallback(async () => {
        try {
            const res = await fetch(API + '/product-category');
            const json = await res.json();
            if (json.status === 'success') setStatsData(json.data?.stats || []);
        } catch (err) {
            toastRef.current('Failed to load analytics', 'error');
        }
    }, []);

    React.useEffect(() => { fetchProducts(); }, [fetchProducts]);
    React.useEffect(() => { if (showAnalytics) fetchAnalytics(); }, [showAnalytics, fetchAnalytics]);

    // Protect admin route
    if (!auth.user || auth.user.role !== 'admin') {
        navigate('#/shop');
        return null;
    }

    const handleSubmit = async (data) => {
        const isEdit = !!editProduct;
        const url = isEdit ? API + '/' + editProduct._id : API;
        const method = isEdit ? 'PATCH' : 'POST';
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (auth.token) headers['Authorization'] = 'Bearer ' + auth.token;
            const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
            const json = await res.json();
            if (res.status === 401) { auth.logout(); toastRef.current('Session expired', 'error'); navigate('#/login'); return; }
            if (res.status === 403) { toastRef.current('No permission', 'error'); return; }
            if (res.ok) {
                toastRef.current(isEdit ? 'Product updated' : 'Product created', 'success');
                setEditProduct(null); setShowAddModal(false); fetchProducts();
            } else {
                toastRef.current(json.message || 'Operation failed', 'error');
            }
        } catch (err) { toastRef.current('Network error', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            const headers = {};
            if (auth.token) headers['Authorization'] = 'Bearer ' + auth.token;
            const res = await fetch(API + '/' + id, { method: 'DELETE', headers });
            if (res.status === 401) { auth.logout(); toastRef.current('Session expired', 'error'); navigate('#/login'); return; }
            if (res.ok || res.status === 204) {
                toastRef.current('Product deleted', 'success'); fetchProducts();
            } else {
                const json = await res.json();
                toastRef.current(json.message || 'Delete failed', 'error');
            }
        } catch (err) { toastRef.current('Network error', 'error'); }
    };

    const handleBulkDelete = async () => {
        if (!confirm('Delete ' + selected.length + ' product(s)?')) return;
        try {
            const headers = {};
            if (auth.token) headers['Authorization'] = 'Bearer ' + auth.token;
            await Promise.all(selected.map(id => fetch(API + '/' + id, { method: 'DELETE', headers })));
            toastRef.current(selected.length + ' products deleted', 'success');
            setSelected([]); fetchProducts();
        } catch (err) { toastRef.current('Bulk delete failed', 'error'); }
    };

    const handleToggle = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div>
            <AppHeader auth={auth} navigate={navigate} route="#/admin" onLogout={onLogout} />
            <AdminBar
                productCount={products.length}
                onAddProduct={() => { setEditProduct(null); setShowAddModal(true); }}
                showAnalytics={showAnalytics}
                onToggleAnalytics={() => setShowAnalytics(p => !p)}
            />
            <div className="layout">
                <KpiCards products={products} />

                {showAnalytics && statsData.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.2rem', fontWeight: 600 }}>Category Analytics</h3>
                        <div className="stats-grid">
                            {statsData.map(s => (
                                <div className="stats-card" key={s._id}>
                                    <div className="stats-card__cat">{s._id}</div>
                                    <div className="stats-card__avg">${s.avgPrice ? s.avgPrice.toFixed(0) : 0} avg</div>
                                    <div className="stats-card__row"><span>Products</span><b>{s.numProducts}</b></div>
                                    <div className="stats-card__row"><span>Min</span><b>${s.minPrice}</b></div>
                                    <div className="stats-card__row"><span>Max</span><b>${s.maxPrice}</b></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="filter-bar">
                    <div className="filter-bar__search">
                        <span className="filter-bar__search-icon"><IconSearch /></span>
                        <input className="filter-bar__search-input" type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-bar__controls">
                        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {selected.length > 0 && (
                    <div className="bulk-bar">
                        {selected.length} selected
                        <button className="btn btn--danger btn--sm" onClick={handleBulkDelete}>Delete Selected</button>
                    </div>
                )}

                {loading ? (
                    <div className="empty"><div className="spinner"></div><p className="mt-2">Loading products...</p></div>
                ) : products.length === 0 ? (
                    <div className="empty">
                        <div className="empty__icon"><IconPackage /></div>
                        <div className="empty__text">No products found</div>
                        <div className="empty__sub">Try adjusting your search or filter</div>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{width:'3rem'}}>
                                        <input type="checkbox" className="checkbox" checked={selected.length === products.length && products.length > 0} onChange={() => {
                                            if (selected.length === products.length) setSelected([]);
                                            else setSelected(products.map(p => p._id));
                                        }} />
                                    </th>
                                    <th style={{width:'5.2rem'}}></th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Rating</th>
                                    <th>Seller</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <TableRow key={p._id} product={p}
                                        selected={selected.includes(p._id)}
                                        onToggle={handleToggle}
                                        onView={setDetailProduct}
                                        onEdit={(prod) => { setEditProduct(prod); setShowAddModal(true); }}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {detailProduct && (
                <DetailModal product={detailProduct} onClose={() => setDetailProduct(null)} isAdmin
                    onEdit={(prod) => { setDetailProduct(null); setEditProduct(prod); setShowAddModal(true); }}
                    onDelete={(id) => { setDetailProduct(null); handleDelete(id); }}
                />
            )}
            {showAddModal && (
                <FormModal product={editProduct} onClose={() => { setShowAddModal(false); setEditProduct(null); }} onSubmit={handleSubmit} />
            )}
            <footer className="footer"><div className="layout">© 2026 Local Marketplace. All rights reserved.</div></footer>
        </div>
    );
}
