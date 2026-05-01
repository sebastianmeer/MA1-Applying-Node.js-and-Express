window.MP = window.MP || {};

window.MP.useToast = function useToast() {
    const [toasts, setToasts] = React.useState([]);

    const push = React.useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3400);
    }, []);

    return { toasts, push };
};

window.MP.useAuth = function useAuth() {
    const [token, setToken] = React.useState('');
    const [user, setUser] = React.useState(null);
    const [checking, setChecking] = React.useState(true);

    const refreshMe = React.useCallback(async () => {
        try {
            const body = await window.MP.apiJSON(`${window.MP.config.authPath}/me`);
            setUser(window.MP.getUser(body));
        } catch (err) {
            setUser(null);
        } finally {
            setChecking(false);
        }
    }, []);

    React.useEffect(() => {
        refreshMe();
    }, [refreshMe]);

    const login = React.useCallback((nextToken, nextUser) => {
        setToken(nextToken || '');
        setUser(nextUser || null);
    }, []);

    const logout = React.useCallback(async () => {
        try {
            await window.MP.apiJSON(`${window.MP.config.authPath}/logout`);
        } catch (err) {
            // The visible session state should still clear.
        }
        setToken('');
        setUser(null);
    }, []);

    return { token, user, checking, login, logout, setUser };
};
