/* ══════════════════════════════════════════════════════════════════════════════
   Hooks & Constants — Shared state logic and configuration
   ══════════════════════════════════════════════════════════════════════════════ */

const API = '/api/products';

const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Sports', 'Home & Garden', 'Furniture'];

const SORT_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Name: A → Z', value: 'name' },
    { label: 'Rating: High to Low', value: '-rating' },
];

const CATEGORY_ICONS = {
    'Electronics': '💻',
    'Fashion': '👗',
    'Books': '📚',
    'Sports': '⚽',
    'Home & Garden': '🌿',
    'Furniture': '🪑',
};

const BADGE_MAP = {
    'electronics': 'badge--electronics',
    'fashion': 'badge--fashion',
    'books': 'badge--books',
    'sports': 'badge--sports',
    'home & garden': 'badge--home',
    'furniture': 'badge--furniture',
};

function badgeClass(cat) {
    return BADGE_MAP[(cat || '').toLowerCase()] || 'badge--other';
}

function categoryIconClass(cat) {
    const map = {
        'Electronics': 'category-card__icon--electronics',
        'Fashion': 'category-card__icon--fashion',
        'Books': 'category-card__icon--books',
        'Sports': 'category-card__icon--sports',
        'Home & Garden': 'category-card__icon--home',
        'Furniture': 'category-card__icon--furniture',
    };
    return map[cat] || '';
}

const DEFAULT_IMG = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';

// ── useDebounce ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
    if (delay === undefined) delay = 300;
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(function() {
        var id = setTimeout(function() { setDebounced(value); }, delay);
        return function() { clearTimeout(id); };
    }, [value, delay]);
    return debounced;
}

// ── useToast ────────────────────────────────────────────────────────────────
function useToast() {
    const [toasts, setToasts] = React.useState([]);
    const show = React.useCallback(function(message, type) {
        if (!type) type = 'default';
        var id = Date.now();
        setToasts(function(prev) { return prev.concat({ id: id, message: message, type: type }); });
        setTimeout(function() {
            setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); });
        }, 3500);
    }, []);
    const showRef = React.useRef(show);
    showRef.current = show;
    return { toasts: toasts, showRef: showRef };
}

// ── useAuth ─────────────────────────────────────────────────────────────────
function useAuth() {
    const [user, setUser] = React.useState(null);
    const [token, setToken] = React.useState(null);

    React.useEffect(function() {
        var stored = localStorage.getItem('marketplace_token');
        if (!stored) return;
        try {
            var parts = stored.split('.');
            if (parts.length !== 3) throw new Error('bad');
            var payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp < Date.now() / 1000) {
                localStorage.removeItem('marketplace_token');
                return;
            }
            setToken(stored);
            var storedUser = localStorage.getItem('marketplace_user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch(e) {
            localStorage.removeItem('marketplace_token');
        }
    }, []);

    const login = React.useCallback(function(tok, usr) {
        localStorage.setItem('marketplace_token', tok);
        localStorage.setItem('marketplace_user', JSON.stringify(usr));
        setToken(tok);
        setUser(usr);
    }, []);

    const logout = React.useCallback(function() {
        localStorage.removeItem('marketplace_token');
        localStorage.removeItem('marketplace_user');
        setToken(null);
        setUser(null);
    }, []);

    return { user: user, token: token, login: login, logout: logout };
}

// ── useRouter (hash-based) ──────────────────────────────────────────────────
function useRouter() {
    const [route, setRoute] = React.useState(window.location.hash || '#/');

    React.useEffect(function() {
        var handler = function() { setRoute(window.location.hash || '#/'); };
        window.addEventListener('hashchange', handler);
        return function() { window.removeEventListener('hashchange', handler); };
    }, []);

    const navigate = React.useCallback(function(hash) {
        window.location.hash = hash;
    }, []);

    return { route: route, navigate: navigate };
}
