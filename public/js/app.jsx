/* ══════════════════════════════════════════════════════════════════════════════
   App — Router & Mount
   ══════════════════════════════════════════════════════════════════════════════ */

function App() {
    const { route, navigate } = useRouter();
    const auth = useAuth();
    const { toasts, showRef: toastRef } = useToast();

    const onLogout = () => {
        auth.logout();
        toastRef.current('Logged out', 'default');
        navigate('#/');
    };

    // Route matching
    let page = null;
    if (route.startsWith('#/login')) {
        // Already logged in → redirect
        if (auth.user) {
            if (auth.user.role === 'admin') navigate('#/admin');
            else navigate('#/shop');
        }
        page = <LoginPage navigate={navigate} auth={auth} />;
    } else if (route.startsWith('#/admin')) {
        page = <AdminPage navigate={navigate} auth={auth} onLogout={onLogout} toastRef={toastRef} />;
    } else if (route.startsWith('#/shop')) {
        page = <ShopPage navigate={navigate} auth={auth} onLogout={onLogout} toastRef={toastRef} />;
    } else {
        // Landing page (#/ or empty)
        if (auth.user) {
            // Logged-in user visiting landing → go to shop/admin
            if (auth.user.role === 'admin') navigate('#/admin');
            else navigate('#/shop');
        }
        page = <LandingPage navigate={navigate} auth={auth} onLogout={onLogout} />;
    }

    return (
        <React.Fragment>
            {page}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
                ))}
            </div>
        </React.Fragment>
    );
}

// ── Mount ────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
