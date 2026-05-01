function AuthPanel({ auth, toast }) {
    const [mode, setMode] = React.useState('login');
    const [loading, setLoading] = React.useState(false);
    const [resetMessage, setResetMessage] = React.useState('');
    const [form, setForm] = React.useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'user',
        resetToken: '',
    });

    const tabs = [
        { id: 'login', label: 'Login' },
        { id: 'signup', label: 'Signup' },
        { id: 'forgot', label: 'Forgot' },
        { id: 'reset', label: 'Reset' },
    ];

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setResetMessage('');

        try {
            if (mode === 'forgot') {
                const body = await window.MP.apiJSON(`${window.MP.config.authPath}/forgotPassword`, {
                    method: 'POST',
                    body: JSON.stringify({ email: form.email }),
                });
                setResetMessage(body.resetToken ? `Reset token: ${body.resetToken}` : body.message || 'Reset email sent.');
                toast.push('Password reset email sent', 'success');
                return;
            }

            if (mode === 'reset') {
                const body = await window.MP.apiJSON(`${window.MP.config.authPath}/resetPassword/${form.resetToken}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ password: form.password, passwordConfirm: form.passwordConfirm }),
                });
                auth.login(body.token, window.MP.getUser(body));
                toast.push('Password reset. You are logged in.', 'success');
                return;
            }

            const payload =
                mode === 'login'
                    ? { email: form.email, password: form.password }
                    : {
                          name: form.name,
                          email: form.email,
                          password: form.password,
                          passwordConfirm: form.passwordConfirm || form.password,
                          role: form.role,
                      };

            const body = await window.MP.apiJSON(`${window.MP.config.authPath}/${mode === 'login' ? 'login' : 'signup'}`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            auth.login(body.token, window.MP.getUser(body));
            toast.push(mode === 'login' ? 'Logged in successfully' : 'Account created', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-layout">
                <section className="auth-copy">
                    <div className="auth-brand">
                        <div className="brand-mark">
                            <Icon name="logo" />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ecommerce</p>
                            <p className="text-xl font-extrabold">Local Marketplace</p>
                        </div>
                    </div>

                    <h1 className="auth-title">A cleaner way to manage marketplace products.</h1>
                    <p className="auth-subtitle">
                        Browse products, review category pricing, and manage admin-only inventory actions from one focused dashboard.
                    </p>

                    <div className="auth-points">
                        <div className="auth-point">
                            <Icon name="shoppingBag" className="mb-4 h-9 w-9 text-primary" />
                            <p className="font-extrabold">Products</p>
                            <p className="mt-1 text-sm text-slate-500">Protected catalog data</p>
                        </div>
                        <div className="auth-point">
                            <Icon name="chartBar" className="mb-4 h-9 w-9 text-teal-600" />
                            <p className="font-extrabold">Analytics</p>
                            <p className="mt-1 text-sm text-slate-500">Category price summaries</p>
                        </div>
                        <div className="auth-point">
                            <Icon name="shield" className="mb-4 h-9 w-9 text-orange-500" />
                            <p className="font-extrabold">Admin</p>
                            <p className="mt-1 text-sm text-slate-500">Role-based controls</p>
                        </div>
                    </div>
                </section>

                <form className="auth-card" onSubmit={submit}>
                    <div className="mb-5">
                        <div className="flex items-center gap-2 text-sm font-extrabold text-primary">
                            <Icon name="lock" className="h-4 w-4" />
                            Secure access
                        </div>
                        <h2 className="mt-2 text-2xl font-extrabold">
                            {mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Password recovery' : mode === 'reset' ? 'Reset password' : 'Welcome back'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Use your marketplace account to continue.</p>
                    </div>

                    <div className="auth-tabs">
                        {tabs.map((tab) => (
                            <button key={tab.id} type="button" className={`auth-tab ${mode === tab.id ? 'is-active' : ''}`} onClick={() => setMode(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="form-stack">
                        {mode === 'signup' && (
                            <label className="field">
                                <span className="label-text">Name</span>
                                <input className="input input-bordered w-full" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                            </label>
                        )}

                        {mode !== 'reset' && (
                            <label className="field">
                                <span className="label-text">Email</span>
                                <input className="input input-bordered w-full" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                            </label>
                        )}

                        {mode === 'reset' && (
                            <label className="field">
                                <span className="label-text">Reset token</span>
                                <input className="input input-bordered w-full" value={form.resetToken} onChange={(event) => update('resetToken', event.target.value)} required />
                            </label>
                        )}

                        {mode !== 'forgot' && (
                            <label className="field">
                                <span className="label-text">Password</span>
                                <input className="input input-bordered w-full" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} minLength="8" required />
                            </label>
                        )}

                        {(mode === 'signup' || mode === 'reset') && (
                            <label className="field">
                                <span className="label-text">Confirm password</span>
                                <input className="input input-bordered w-full" type="password" value={form.passwordConfirm} onChange={(event) => update('passwordConfirm', event.target.value)} minLength="8" required={mode === 'reset'} />
                            </label>
                        )}

                        {mode === 'signup' && (
                            <label className="field">
                                <span className="label-text">Role</span>
                                <select className="select select-bordered w-full" value={form.role} onChange={(event) => update('role', event.target.value)}>
                                    <option value="user">Normal user</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>
                        )}

                        {resetMessage && <div className="alert alert-info text-sm">{resetMessage}</div>}

                        <button className="btn btn-primary mt-5 w-full" disabled={loading}>
                            {loading && <span className="loading loading-spinner loading-sm" />}
                            {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send email' : 'Reset password'}
                            <Icon name="arrowRight" className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

function Toasts({ toasts }) {
    return (
        <div className="toast toast-end toast-bottom z-50">
            {toasts.map((toast) => (
                <div key={toast.id} className={`alert shadow-lg ${toast.type === 'error' ? 'alert-error' : toast.type === 'success' ? 'alert-success' : 'alert-info'}`}>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="grid min-h-screen place-items-center bg-slate-50">
            <div className="panel flex items-center gap-3 px-5 py-4">
                <span className="loading loading-spinner loading-md text-primary" />
                <span className="font-semibold text-slate-700">Opening marketplace</span>
            </div>
        </div>
    );
}

window.AuthPanel = AuthPanel;
window.Toasts = Toasts;
window.LoadingScreen = LoadingScreen;
