const { useCallback, useEffect, useMemo, useState } = React;

const API_PRODUCTS = '/api/products';
const API_AUTH = '/api/auth';
const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Sports', 'Home & Garden', 'Furniture'];
const SORT_OPTIONS = [
    { value: '', label: 'Newest' },
    { value: 'price', label: 'Price low to high' },
    { value: '-price', label: 'Price high to low' },
    { value: '-rating', label: 'Top rated' },
    { value: 'name', label: 'Name A-Z' },
];

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        cube: <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
        search: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.606 10.606Z" />,
        user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
        shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />,
        chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
        plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
        pencil: <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />,
        trash: <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.827L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49.08 49.08 0 0 0-7.5 0" />,
        arrowRight: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />,
        lock: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />,
        sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />,
        x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />,
    };

    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            {paths[name]}
        </svg>
    );
}

function useAuth() {
    const [token, setToken] = useState(() => localStorage.getItem('marketplace_token') || '');
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('marketplace_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (nextToken, nextUser) => {
        localStorage.setItem('marketplace_token', nextToken);
        localStorage.setItem('marketplace_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
    };

    const logout = async () => {
        try {
            await fetch(`${API_AUTH}/logout`, { credentials: 'include' });
        } catch (err) {
            // Local token cleanup is the important client-side action.
        }
        localStorage.removeItem('marketplace_token');
        localStorage.removeItem('marketplace_user');
        setToken('');
        setUser(null);
    };

    return { token, user, login, logout, setUser };
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3500);
    };
    return { toasts, push };
}

function authHeaders(token, extra = {}) {
    return {
        ...extra,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiJSON(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {}),
        },
    });

    if (res.status === 204) return { ok: true, status: res.status, body: null };

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body.message || 'Request failed');
    }
    return { ok: true, status: res.status, body };
}

function AuthPanel({ auth, toast }) {
    const [mode, setMode] = useState('login');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'user',
    });

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const payload = mode === 'login'
                ? { email: form.email, password: form.password }
                : {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    passwordConfirm: form.passwordConfirm || form.password,
                    role: form.role,
                };
            const { body } = await apiJSON(`${API_AUTH}/${mode === 'login' ? 'login' : 'signup'}`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            auth.login(body.token, body.user);
            toast.push(mode === 'login' ? 'Logged in successfully' : 'Account created', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero min-h-[calc(100vh-4rem)] bg-base-200">
            <div className="hero-content grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_28rem]">
                <div>
                    <div className="badge badge-primary gap-2">
                        <Icon name="lock" className="h-4 w-4" />
                        Protected product catalog
                    </div>
                    <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight lg:text-6xl">
                        Local Marketplace
                    </h1>
                    <p className="mt-4 max-w-2xl text-base-content/70">
                        Sign in to browse products, inspect aggregation analytics, and test the protected product API with JWT cookies and role-based product deletion.
                    </p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {['JWT protected routes', 'DaisyUI controls', 'Heroicons only'].map((item) => (
                            <div className="stats shadow" key={item}>
                                <div className="stat">
                                    <div className="stat-title">{item}</div>
                                    <div className="stat-value text-lg">Ready</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form className="card bg-base-100 shadow-xl" onSubmit={submit}>
                    <div className="card-body gap-4">
                        <div className="tabs tabs-boxed">
                            <button type="button" className={`tab flex-1 ${mode === 'login' ? 'tab-active' : ''}`} onClick={() => setMode('login')}>
                                Login
                            </button>
                            <button type="button" className={`tab flex-1 ${mode === 'signup' ? 'tab-active' : ''}`} onClick={() => setMode('signup')}>
                                Signup
                            </button>
                        </div>

                        {mode === 'signup' && (
                            <label className="form-control">
                                <span className="label-text">Name</span>
                                <input className="input input-bordered" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                            </label>
                        )}

                        <label className="form-control">
                            <span className="label-text">Email</span>
                            <input className="input input-bordered" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                        </label>

                        <label className="form-control">
                            <span className="label-text">Password</span>
                            <input className="input input-bordered" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength="8" required />
                        </label>

                        {mode === 'signup' && (
                            <>
                                <label className="form-control">
                                    <span className="label-text">Confirm password</span>
                                    <input className="input input-bordered" type="password" value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} minLength="8" />
                                </label>
                                <label className="form-control">
                                    <span className="label-text">Role</span>
                                    <select className="select select-bordered" value={form.role} onChange={(e) => update('role', e.target.value)}>
                                        <option value="user">Normal user</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                            </>
                        )}

                        <button className="btn btn-primary" disabled={loading}>
                            {loading && <span className="loading loading-spinner loading-sm" />}
                            {mode === 'login' ? 'Login' : 'Create account'}
                            <Icon name="arrowRight" className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Header({ auth, toast, onOpenAccount }) {
    return (
        <div className="navbar sticky top-0 z-40 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur">
            <div className="flex-1">
                <div className="btn btn-ghost text-xl">
                    <Icon name="cube" />
                    Local Marketplace
                </div>
            </div>
            <div className="flex-none gap-2">
                {auth.user && <div className="badge badge-outline">{auth.user.role}</div>}
                {auth.user && (
                    <button className="btn btn-ghost btn-circle" title="Account" onClick={onOpenAccount}>
                        <Icon name="user" />
                    </button>
                )}
                <button className="btn btn-outline btn-sm" onClick={() => { auth.logout(); toast.push('Logged out'); }}>
                    Logout
                </button>
            </div>
        </div>
    );
}

function Filters({ filters, setFilters, total }) {
    return (
        <div className="grid gap-3 rounded-box bg-base-100 p-4 shadow md:grid-cols-[1fr_12rem_12rem_auto]">
            <label className="input input-bordered flex items-center gap-2">
                <Icon name="search" className="h-4 w-4 opacity-60" />
                <input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} placeholder="Search products" />
            </label>
            <select className="select select-bordered" value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
                <option value="">All categories</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="select select-bordered" value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}>
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="stat rounded-box bg-base-200 py-2">
                <div className="stat-title">Visible</div>
                <div className="stat-value text-xl">{total}</div>
            </div>
        </div>
    );
}

function ProductCard({ product, canManage, onEdit, onDelete }) {
    const finalPrice = product.priceDiscount ? product.price - product.priceDiscount : product.price;
    return (
        <div className="card bg-base-100 shadow">
            <figure className="aspect-[4/3] bg-base-200">
                <img className="h-full w-full object-cover" src={product.image || 'https://placehold.co/600x450?text=Product'} alt={product.name} />
            </figure>
            <div className="card-body gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="card-title text-base">{product.name}</h2>
                        <p className="text-sm text-base-content/60">{product.seller}</p>
                    </div>
                    <div className="badge badge-primary badge-outline">{product.category}</div>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm text-base-content/70">{product.description || 'No description'}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-box bg-base-200 p-2">
                        <div className="text-xs text-base-content/60">Price</div>
                        <div className="font-semibold">${finalPrice}</div>
                    </div>
                    <div className="rounded-box bg-base-200 p-2">
                        <div className="text-xs text-base-content/60">Rating</div>
                        <div className="font-semibold">{product.rating}</div>
                    </div>
                    <div className="rounded-box bg-base-200 p-2">
                        <div className="text-xs text-base-content/60">Posted</div>
                        <div className="font-semibold">{product.daysPosted ?? '-'}d</div>
                    </div>
                </div>
                <div className="card-actions items-center justify-between">
                    <div className="tooltip" data-tip={product.productSlug || 'Slug is set on save'}>
                        <span className="badge badge-ghost">Slug</span>
                    </div>
                    {canManage && (
                        <div className="join">
                            <button className="btn join-item btn-sm" onClick={() => onEdit(product)} title="Edit product">
                                <Icon name="pencil" className="h-4 w-4" />
                            </button>
                            <button className="btn join-item btn-error btn-sm" onClick={() => onDelete(product)} title="Delete product">
                                <Icon name="trash" className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProductForm({ product, token, toast, onClose, onSaved }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(() => product || {
        name: '',
        price: '',
        category: 'Electronics',
        description: '',
        rating: 4.5,
        seller: '',
        postedDate: new Date().toISOString().slice(0, 10),
        priceDiscount: '',
        image: '',
        premiumProducts: false,
    });

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                rating: Number(form.rating),
                priceDiscount: form.priceDiscount === '' ? undefined : Number(form.priceDiscount),
                premiumProducts: Boolean(form.premiumProducts),
            };
            if (!payload.image) delete payload.image;
            if (payload.priceDiscount === undefined) delete payload.priceDiscount;

            await apiJSON(product ? `${API_PRODUCTS}/${product._id}` : API_PRODUCTS, {
                method: product ? 'PATCH' : 'POST',
                headers: authHeaders(token),
                body: JSON.stringify(payload),
            });
            toast.push(product ? 'Product updated' : 'Product created', 'success');
            onSaved();
            onClose();
        } catch (err) {
            toast.push(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <form method="dialog">
                    <button type="button" className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={onClose}>
                        <Icon name="x" className="h-4 w-4" />
                    </button>
                </form>
                <h3 className="text-lg font-bold">{product ? 'Edit product' : 'Add product'}</h3>
                <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submit}>
                    <label className="form-control">
                        <span className="label-text">Name</span>
                        <input className="input input-bordered" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Seller</span>
                        <input className="input input-bordered" value={form.seller} onChange={(e) => update('seller', e.target.value)} required />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Price</span>
                        <input className="input input-bordered" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Discount</span>
                        <input className="input input-bordered" type="number" value={form.priceDiscount || ''} onChange={(e) => update('priceDiscount', e.target.value)} />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Category</span>
                        <select className="select select-bordered" value={form.category} onChange={(e) => update('category', e.target.value)}>
                            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                    </label>
                    <label className="form-control">
                        <span className="label-text">Rating</span>
                        <input className="input input-bordered" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => update('rating', e.target.value)} />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Posted date</span>
                        <input className="input input-bordered" type="date" value={String(form.postedDate || '').slice(0, 10)} onChange={(e) => update('postedDate', e.target.value)} required />
                    </label>
                    <label className="form-control">
                        <span className="label-text">Image URL</span>
                        <input className="input input-bordered" value={form.image || ''} onChange={(e) => update('image', e.target.value)} />
                    </label>
                    <label className="form-control md:col-span-2">
                        <span className="label-text">Description</span>
                        <input className="input input-bordered" maxLength="50" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
                        <span className="label-text-alt">{(form.description || '').length}/50</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
                        <input type="checkbox" className="toggle toggle-primary" checked={Boolean(form.premiumProducts)} onChange={(e) => update('premiumProducts', e.target.checked)} />
                        <span className="label-text">Premium product, hidden by query and aggregate middleware</span>
                    </label>
                    <button className="btn btn-primary md:col-span-2" disabled={loading}>
                        {loading && <span className="loading loading-spinner loading-sm" />}
                        Save product
                    </button>
                </form>
            </div>
        </dialog>
    );
}

function Analytics({ stats }) {
    if (!stats.length) {
        return (
            <div className="alert">
                <Icon name="chart" />
                <span>No category aggregation data yet. Add products below 1000 to see results.</span>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
                <div className="card bg-base-100 shadow" key={item.category}>
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <h3 className="card-title">{item.category}</h3>
                            <div className="badge badge-secondary">{item.numProducts} products</div>
                        </div>
                        <div className="stats stats-vertical bg-base-200 lg:stats-horizontal">
                            <div className="stat">
                                <div className="stat-title">Average</div>
                                <div className="stat-value text-lg">${item.avgPrice}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Min</div>
                                <div className="stat-value text-lg">${item.minPrice}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Max</div>
                                <div className="stat-value text-lg">${item.maxPrice}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AccountModal({ auth, toast, onClose }) {
    const [profile, setProfile] = useState({ name: auth.user.name, email: auth.user.email });
    const [passwords, setPasswords] = useState({ passwordCurrent: '', password: '', passwordConfirm: '' });

    const updateProfile = async () => {
        try {
            const { body } = await apiJSON(`${API_AUTH}/updateMe`, {
                method: 'PATCH',
                headers: authHeaders(auth.token),
                body: JSON.stringify(profile),
            });
            const nextUser = body.user || body.data.user;
            localStorage.setItem('marketplace_user', JSON.stringify(nextUser));
            auth.setUser(nextUser);
            toast.push('Profile updated', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        }
    };

    const updatePassword = async () => {
        try {
            const { body } = await apiJSON(`${API_AUTH}/updateMyPassword`, {
                method: 'PATCH',
                headers: authHeaders(auth.token),
                body: JSON.stringify(passwords),
            });
            auth.login(body.token, body.user);
            setPasswords({ passwordCurrent: '', password: '', passwordConfirm: '' });
            toast.push('Password updated. New token issued.', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        }
    };

    const deleteMe = async () => {
        if (!confirm('Delete the current user session account?')) return;
        try {
            await apiJSON(`${API_AUTH}/deleteMe`, {
                method: 'DELETE',
                headers: authHeaders(auth.token),
            });
            await auth.logout();
            toast.push('Current user deleted', 'success');
            onClose();
        } catch (err) {
            toast.push(err.message, 'error');
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={onClose}>
                    <Icon name="x" className="h-4 w-4" />
                </button>
                <h3 className="text-lg font-bold">Current User</h3>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <h4 className="font-semibold">Update details</h4>
                        <input className="input input-bordered w-full" value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} />
                        <input className="input input-bordered w-full" type="email" value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} />
                        <button className="btn btn-primary w-full" onClick={updateProfile}>Save details</button>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold">Update password</h4>
                        <input className="input input-bordered w-full" type="password" placeholder="Current password" value={passwords.passwordCurrent} onChange={(e) => setPasswords((prev) => ({ ...prev, passwordCurrent: e.target.value }))} />
                        <input className="input input-bordered w-full" type="password" placeholder="New password" value={passwords.password} onChange={(e) => setPasswords((prev) => ({ ...prev, password: e.target.value }))} />
                        <input className="input input-bordered w-full" type="password" placeholder="Confirm new password" value={passwords.passwordConfirm} onChange={(e) => setPasswords((prev) => ({ ...prev, passwordConfirm: e.target.value }))} />
                        <button className="btn btn-secondary w-full" onClick={updatePassword}>Change password</button>
                    </div>
                </div>
                <div className="modal-action justify-between">
                    <button className="btn btn-error" onClick={deleteMe}>Delete current user</button>
                    <button className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </dialog>
    );
}

function Dashboard({ auth, toast }) {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState([]);
    const [filters, setFilters] = useState({ search: '', category: '', sort: '' });
    const [loading, setLoading] = useState(false);
    const [formProduct, setFormProduct] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const canManage = auth.user && auth.user.role === 'admin';

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.set('category', filters.category);
            if (filters.sort) params.set('sort', filters.sort);
            const { body } = await apiJSON(`${API_PRODUCTS}${params.toString() ? `?${params}` : ''}`, {
                headers: authHeaders(auth.token),
            });
            setProducts(body.data.products || []);
        } catch (err) {
            toast.push(err.message, 'error');
            if (/logged in|token|expired/i.test(err.message)) auth.logout();
        } finally {
            setLoading(false);
        }
    }, [auth.token, filters.category, filters.sort]);

    const fetchStats = useCallback(async () => {
        try {
            const { body } = await apiJSON(`${API_PRODUCTS}/product-category`, {
                headers: authHeaders(auth.token),
            });
            setStats(body.data.stats || []);
        } catch (err) {
            toast.push(err.message, 'error');
        }
    }, [auth.token]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const visibleProducts = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) => [product.name, product.category, product.seller].join(' ').toLowerCase().includes(term));
    }, [products, filters.search]);

    const deleteProduct = async (product) => {
        if (!confirm(`Delete ${product.name}?`)) return;
        try {
            await apiJSON(`${API_PRODUCTS}/${product._id}`, {
                method: 'DELETE',
                headers: authHeaders(auth.token),
            });
            toast.push('Product deleted', 'success');
            fetchProducts();
            fetchStats();
        } catch (err) {
            toast.push(err.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Header auth={auth} toast={toast} onOpenAccount={() => setShowAccount(true)} />
            <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
                <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                        <div className="badge badge-primary gap-2">
                            <Icon name="sparkles" className="h-4 w-4" />
                            Premium products are hidden by middleware
                        </div>
                        <h1 className="mt-3 text-3xl font-bold">Product operations</h1>
                        <p className="mt-2 text-base-content/70">
                            Browse protected products, inspect category aggregation for prices below 1000, and test admin-only deletion.
                        </p>
                    </div>
                    {canManage && (
                        <button className="btn btn-primary self-end" onClick={() => setShowCreate(true)}>
                            <Icon name="plus" />
                            Add product
                        </button>
                    )}
                </section>

                <Filters filters={filters} setFilters={setFilters} total={visibleProducts.length} />

                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon name="chart" />
                        <h2 className="text-xl font-bold">Product category aggregation</h2>
                    </div>
                    <Analytics stats={stats} />
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon name="cube" />
                        <h2 className="text-xl font-bold">Products</h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg" /></div>
                    ) : visibleProducts.length === 0 ? (
                        <div className="alert">
                            <Icon name="search" />
                            <span>No products matched the current filters.</span>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {visibleProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    canManage={canManage}
                                    onEdit={setFormProduct}
                                    onDelete={deleteProduct}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {(showCreate || formProduct) && (
                <ProductForm
                    product={formProduct}
                    token={auth.token}
                    toast={toast}
                    onClose={() => { setShowCreate(false); setFormProduct(null); }}
                    onSaved={() => { fetchProducts(); fetchStats(); }}
                />
            )}
            {showAccount && <AccountModal auth={auth} toast={toast} onClose={() => setShowAccount(false)} />}
        </div>
    );
}

function Toasts({ toasts }) {
    return (
        <div className="toast toast-end toast-bottom z-50">
            {toasts.map((toast) => (
                <div key={toast.id} className={`alert ${toast.type === 'error' ? 'alert-error' : toast.type === 'success' ? 'alert-success' : 'alert-info'}`}>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}

function App() {
    const auth = useAuth();
    const toast = useToast();

    return (
        <>
            {auth.user ? (
                <Dashboard auth={auth} toast={toast} />
            ) : (
                <AuthPanel auth={auth} toast={toast} />
            )}
            <Toasts toasts={toast.toasts} />
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
