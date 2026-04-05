const { useState, useEffect, useCallback, useMemo, useRef } = React;

const API = '/api/products';

const CATEGORIES = [
    'Electronics', 'Fashion', 'Books', 'Sports', 'Home & Garden', 'Furniture'
];

const SORT_OPTIONS = [
    { label: 'Default Sorting', value: '' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Rating: High to Low', value: '-rating' }
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function IconSearch() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconHeart() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function IconBag() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function IconUser() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconExpand() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>; }
function IconStar({ filled }) { return <svg width="12" height="12" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function IconFacebook() { return <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>; }
function IconTwitter() { return <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>; }
function IconInstagram() { return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function IconPackage() { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function IconClose() { return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconTruck() { return <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function IconCard() { return <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IconHeadphones() { return <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent)'}}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-3h3v1z"/><path d="M3 19a2 2 0 0 0 2 2h1v-3H3v1z"/></svg>; }

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const show = useCallback((message, type = 'default') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);
    const showRef = useRef(show);
    showRef.current = show;
    return { toasts, showRef };
}

function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('marketplace_token');
        if (!stored) return;
        try {
            const parts = stored.split('.');
            if (parts.length !== 3) throw new Error('bad token');
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp < Date.now() / 1000) {
                localStorage.removeItem('marketplace_token');
                return;
            }
            setToken(stored);
            const storedUser = localStorage.getItem('marketplace_user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem('marketplace_token');
        }
    }, []);

    const login = useCallback((tok, usr) => {
        localStorage.setItem('marketplace_token', tok);
        localStorage.setItem('marketplace_user', JSON.stringify(usr));
        setToken(tok);
        setUser(usr);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('marketplace_token');
        localStorage.removeItem('marketplace_user');
        setToken(null);
        setUser(null);
    }, []);

    return { user, token, login, logout };
}

// ── AuthModal ─────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState('user');

    const handleBackdrop = () => { if (!loading) onClose(); };

    const handleLogin = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const json = await res.json();
            if (res.ok) { onSuccess(json.token, json.user); }
            else { setError(json.message || 'Login failed'); }
        } catch { setError('Network error, please try again'); }
        finally { setLoading(false); }
    };

    const handleRegister = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }),
            });
            const json = await res.json();
            if (res.ok) { onSuccess(json.token, json.user); }
            else { setError(json.message || 'Registration failed'); }
        } catch { setError('Network error, please try again'); }
        finally { setLoading(false); }
    };

    return (
        <div className="overlay" onClick={handleBackdrop}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Sign In Required</h2>
                    <button className="modal__close" onClick={handleBackdrop} disabled={loading}><IconClose /></button>
                </div>
                <div className="modal__body">
                    <p style={{marginBottom: '2.4rem', color: 'var(--text-secondary)'}}>
                        Please log in to your account to view product details and make purchases.
                    </p>
                    <div className="auth-tabs">
                        <button className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`} onClick={() => { setTab('login'); setError(''); }} type="button">Login</button>
                        <button className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`} onClick={() => { setTab('register'); setError(''); }} type="button">Register</button>
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    
                    {tab === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input className="form-input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input className="form-input" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                                {loading ? 'Logging in…' : 'Log In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" type="text" value={regName} onChange={e => setRegName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input className="form-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input className="form-input" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={8} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Account Type *</label>
                                <select className="form-select" value={regRole} onChange={e => setRegRole(e.target.value)}>
                                    <option value="user">Shopper</option>
                                    <option value="admin">Store Manager (Admin)</option>
                                </select>
                            </div>
                            <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                                {loading ? 'Registering…' : 'Register'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Components ────────────────────────────────────────────────────────────────
function ProductCard({ product, onAction }) {
    // Use image placeholder or default
    const fakeImage = product.image || 'https://placehold.co/400x500/f4f4f4/64748b?text=Marketplace+Product';
    const discount = product.priceDiscount ? Math.round((product.priceDiscount / product.price) * 100) : 0;
    
    return (
        <div className="product-card" onClick={() => onAction('view', product)}>
            <div className="product-card__img-wrap">
                {discount > 0 && <div className="product-card__badge">{discount}% off</div>}
                <img className="product-card__img" src={fakeImage} alt={product.name} />
                
                <div className="product-card__actions">
                    <button className="product-card__action-btn" onClick={e => { e.stopPropagation(); onAction('like', product); }} title="Add to Wishlist"><IconHeart /></button>
                    <button className="product-card__action-btn" onClick={e => { e.stopPropagation(); onAction('view', product); }} title="Quick View"><IconExpand /></button>
                    <button className="product-card__action-btn" onClick={e => { e.stopPropagation(); onAction('cart', product); }} title="Add to Cart"><IconBag /></button>
                </div>
            </div>
            
            <div className="product-card__meta">
                <span>{product.category || 'Other'}</span>
                {product.rating && (
                    <div className="product-card__rating-wrap">
                        <IconStar filled /> {product.rating}
                    </div>
                )}
            </div>
            
            <div className="product-card__name">{product.name}</div>
            
            <div className="product-card__price-row">
                {discount > 0 ? (
                    <>
                        <span className="product-card__price">${(product.price - product.priceDiscount).toFixed(2)}</span>
                        <span className="product-card__price-old">${product.price.toFixed(2)}</span>
                    </>
                ) : (
                    <span className="product-card__price">${product.price.toFixed(2)}</span>
                )}
            </div>
        </div>
    );
}

function SidebarFilter({ selectedCategories, onToggleCat, setPriceRange }) {
    return (
        <aside className="sidebar">
            <h3 className="sidebar-title">Filter Options</h3>
            
            <div className="filter-group">
                <h4 className="filter-title">By Categories</h4>
                <ul className="filter-list">
                    {CATEGORIES.map(cat => (
                        <li key={cat}>
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox-input" 
                                    checked={selectedCategories.includes(cat)} 
                                    onChange={() => onToggleCat(cat)} />
                                {cat}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="filter-group">
                <h4 className="filter-title">Price</h4>
                <div className="price-label">$10.00 — $200.00</div>
                <div className="price-slider">
                    <div className="price-slider__fill" style={{ width: '60%' }}></div>
                    <div className="price-slider__handle" style={{ left: '0%' }}></div>
                    <div className="price-slider__handle" style={{ left: '60%' }}></div>
                </div>
            </div>
            
            <div className="filter-group review-filter">
                <h4 className="filter-title">Review</h4>
                <ul className="filter-list">
                    {[5,4,3,2,1].map(star => (
                        <li key={star}>
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox-input" />
                                <div className="stars">
                                    {Array.from({length: 5}).map((_, i) => (
                                        <div key={i} className={i < star ? '' : 'stars--dim'}><IconStar filled /></div>
                                    ))}
                                </div>
                                {star} Star
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="filter-group">
                <h4 className="filter-title">Availability</h4>
                <ul className="filter-list">
                    <li><label className="checkbox-label"><input type="checkbox" className="checkbox-input" defaultChecked /> In Stock</label></li>
                    <li><label className="checkbox-label"><input type="checkbox" className="checkbox-input" /> Out of Stocks</label></li>
                </ul>
            </div>
        </aside>
    );
}

// ── App Container ─────────────────────────────────────────────────────────────
function App() {
    const auth = useAuth();
    const { toasts, showRef: toastRef } = useToast();
    
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('');
    
    // Auth requirement state
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API);
            const json = await res.json();
            if (json.status === 'success') {
                const prods = json.data?.products || [];
                // Client side simulate some mapping if needed
                setAllProducts(prods);
            }
        } catch {
            toastRef.current('Failed to load shop data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Derived State
    const filteredProducts = useMemo(() => {
        let items = [...allProducts];
        if (selectedCategories.length > 0) {
            items = items.filter(p => {
                const c = p.category || '';
                return selectedCategories.includes(c);
            });
        }
        
        if (sortBy === 'price') items.sort((a,b) => a.price - b.price);
        if (sortBy === '-price') items.sort((a,b) => b.price - a.price);
        if (sortBy === '-rating') items.sort((a,b) => (b.rating||0) - (a.rating||0));
        
        return items;
    }, [allProducts, selectedCategories, sortBy]);

    // Interactions
    const toggleCategory = (cat) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleProductAction = (action, product) => {
        if (!auth.user) {
            setShowAuthModal(true);
            return;
        }
        // If logged in:
        if (action === 'like') toastRef.current('Saved for later!', 'success');
        if (action === 'cart') toastRef.current('Added to Cart!', 'success');
        if (action === 'view') toastRef.current('Opening product details...', 'default');
    };

    const handleAuthSuccess = (token, user) => {
        auth.login(token, user);
        setShowAuthModal(false);
        toastRef.current(`Welcome back, ${user.name}!`, 'success');
    };

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="layout top-bar__inner">
                    <div>Call Us : +123-456-789</div>
                    <div className="top-bar__promo">
                        Sign up and GET 20% OFF for your first order. <a href="#" onClick={e=>{e.preventDefault(); setShowAuthModal(true);}}>Sign up now</a>
                    </div>
                    <div className="top-bar__social">
                        <a href="#"><IconFacebook /></a>
                        <a href="#"><IconTwitter /></a>
                        <a href="#"><IconInstagram /></a>
                    </div>
                </div>
            </div>
            
            {/* Header */}
            <header className="header">
                <div className="layout header__inner">
                    <div className="header__logo">
                        <div className="header__logo-icon"><IconPackage /></div>
                        Local <span>Marketplace</span>
                    </div>
                    <nav>
                        <ul className="header__nav">
                            <li><button className="header__nav-link">Home</button></li>
                            <li><button className="header__nav-link header__nav-link--active">Shop</button></li>
                            <li><button className="header__nav-link">Electronics</button></li>
                            <li><button className="header__nav-link">Fashion</button></li>
                            <li><button className="header__nav-link">Books</button></li>
                        </ul>
                    </nav>
                    <div className="header__actions">
                        <button className="header__action-btn"><IconSearch /></button>
                        <button className="header__action-btn" onClick={() => auth.user ? toastRef.current('Wishlist empty') : setShowAuthModal(true)}><IconHeart /></button>
                        <button className="header__action-btn" onClick={() => auth.user ? toastRef.current('Cart empty') : setShowAuthModal(true)}>
                            <IconBag />
                            {auth.user && <span className="header__cart-badge">0</span>}
                        </button>
                        <button className="header__action-btn" onClick={() => auth.user ? auth.logout() : setShowAuthModal(true)}>
                            <IconUser />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="page-hero">
                <div className="layout">
                    <h1 className="page-hero__title">Shop</h1>
                    <div className="breadcrumb">
                        <a href="#">Home</a> / <span>Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Shop */}
            <main className="layout shop-layout">
                {/* Sidebar */}
                <SidebarFilter 
                    selectedCategories={selectedCategories} 
                    onToggleCat={toggleCategory} 
                />
                
                {/* Grid Content */}
                <div>
                    <div className="active-filters-bar">
                        <div className="results-count">Showing 1-12 of 2560 results</div>
                        
                        <div className="sort-by">
                            Sort by : 
                            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {selectedCategories.length > 0 && (
                        <div className="active-tags">
                            <span className="active-tags-label">Active Filter:</span>
                            {selectedCategories.map(cat => (
                                <div key={cat} className="filter-tag">
                                    {cat} <button onClick={() => toggleCategory(cat)}>&times;</button>
                                </div>
                            ))}
                            <button className="clear-all" onClick={() => setSelectedCategories([])}>Clear All</button>
                        </div>
                    )}
                    
                    {loading ? (
                        <div style={{padding:'6rem', textAlign:'center'}}>Loading products...</div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {filteredProducts.slice(0,12).map(p => (
                                    <ProductCard 
                                        key={p._id} 
                                        product={p} 
                                        onAction={handleProductAction} 
                                    />
                                ))}
                            </div>
                            
                            <div className="pagination">
                                <button className="page-btn">&lt;</button>
                                <button className="page-btn page-btn--active">1</button>
                                <button className="page-btn">2</button>
                                <button className="page-btn">3</button>
                                <span style={{color:'var(--text-muted)'}}>...</span>
                                <button className="page-btn">10</button>
                                <button className="page-btn">&gt;</button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Features Bottom */}
            <div className="layout">
                <div className="features-row">
                    <div className="feature-item">
                        <div className="feature-icon"><IconTruck /></div>
                        <div>
                            <div className="feature-title">Free Shipping</div>
                            <div className="feature-desc">Free shipping for order above $50</div>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"><IconCard /></div>
                        <div>
                            <div className="feature-title">Flexible Payment</div>
                            <div className="feature-desc">Multiple secure payment options</div>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"><IconHeadphones /></div>
                        <div>
                            <div className="feature-title">24x7 Support</div>
                            <div className="feature-desc">We support online all days.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
            )}

            {/* Toasts */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
                ))}
            </div>
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
