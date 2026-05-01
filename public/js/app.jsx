function Dashboard({ auth, toast }) {
    const token = auth.token;
    const logout = auth.logout;
    const pushToast = toast.push;
    const [view, setView] = React.useState('browse');
    const [search, setSearch] = React.useState('');
    const [products, setProducts] = React.useState([]);
    const [catalog, setCatalog] = React.useState([]);
    const [stats, setStats] = React.useState([]);
    const [resultCount, setResultCount] = React.useState(0);
    const [loadingProducts, setLoadingProducts] = React.useState(false);
    const [loadingStats, setLoadingStats] = React.useState(false);
    const [formProduct, setFormProduct] = React.useState(null);
    const [showCreate, setShowCreate] = React.useState(false);
    const [detailProduct, setDetailProduct] = React.useState(null);
    const [showAccount, setShowAccount] = React.useState(false);
    const [filters, setFilters] = React.useState({
        category: '',
        sort: '-createdAt',
        fields: '',
        limit: '12',
        page: '1',
        minPrice: '',
        maxPrice: '',
    });

    const canManage = auth.user && auth.user.role === 'admin';

    const handleApiError = React.useCallback((err) => {
        pushToast(err.message, 'error');
        if (/logged in|token|expired|no longer exists|deleted user/i.test(err.message)) {
            logout();
        }
    }, [logout, pushToast]);

    const buildProductQuery = React.useCallback(() => {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.fields) params.set('fields', filters.fields);
        if (filters.limit) params.set('limit', filters.limit);
        if (filters.page) params.set('page', filters.page);
        if (filters.minPrice) params.set('price[gte]', filters.minPrice);
        if (filters.maxPrice) params.set('price[lte]', filters.maxPrice);
        const query = params.toString();
        return query ? `?${query}` : '';
    }, [filters]);

    const fetchProducts = React.useCallback(async () => {
        setLoadingProducts(true);
        try {
            const path = view === 'top' ? `${window.MP.config.productsPath}/top-3-cheap` : `${window.MP.config.productsPath}${buildProductQuery()}`;
            const body = await window.MP.apiJSON(path, { headers: window.MP.authHeaders(token) });
            const nextProducts = window.MP.getProducts(body);
            setProducts(nextProducts);
            setResultCount(body.results ?? nextProducts.length);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoadingProducts(false);
        }
    }, [buildProductQuery, handleApiError, token, view]);

    const fetchCatalog = React.useCallback(async () => {
        try {
            const fields = 'name,price,category,seller,postedDate,daysPosted,description,rating,image,priceDiscount,productSlug';
            const body = await window.MP.apiJSON(`${window.MP.config.productsPath}?limit=200&fields=${fields}`, { headers: window.MP.authHeaders(token) });
            setCatalog(window.MP.getProducts(body));
        } catch (err) {
            handleApiError(err);
        }
    }, [handleApiError, token]);

    const fetchStats = React.useCallback(async () => {
        setLoadingStats(true);
        try {
            const body = await window.MP.apiJSON(`${window.MP.config.productsPath}/product-category`, { headers: window.MP.authHeaders(token) });
            setStats(window.MP.getStats(body));
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoadingStats(false);
        }
    }, [handleApiError, token]);

    const refreshAll = React.useCallback(() => {
        fetchProducts();
        fetchCatalog();
        fetchStats();
    }, [fetchCatalog, fetchProducts, fetchStats]);

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    React.useEffect(() => {
        fetchCatalog();
        fetchStats();
    }, [fetchCatalog, fetchStats]);

    const visibleProducts = React.useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) => [product.name, product.category, product.seller, product.description].filter(Boolean).join(' ').toLowerCase().includes(term));
    }, [products, search]);

    const categoryOptions = React.useMemo(() => {
        const categories = new Set(window.MP.config.categories);
        [...catalog, ...products].forEach((product) => product.category && categories.add(product.category));
        stats.forEach((item) => item.category && categories.add(item.category));
        return Array.from(categories).sort((a, b) => a.localeCompare(b));
    }, [catalog, products, stats]);

    const categoryCounts = React.useMemo(() => {
        const counts = new Map();
        catalog.forEach((product) => {
            if (product.category) counts.set(product.category, (counts.get(product.category) || 0) + 1);
        });
        return categoryOptions.map((category) => ({ name: category, count: counts.get(category) || 0 }));
    }, [catalog, categoryOptions]);

    const setCategory = (category) => {
        setView('browse');
        setFilters((prev) => ({ ...prev, category, page: '1' }));
    };

    const clearFilters = () => {
        setFilters({ category: '', sort: '-createdAt', fields: '', limit: '12', page: '1', minPrice: '', maxPrice: '' });
    };

    const openProduct = async (product, setter) => {
        const id = window.MP.productId(product);
        if (!id) return setter(product);
        try {
            const body = await window.MP.apiJSON(`${window.MP.config.productsPath}/${id}`, { headers: window.MP.authHeaders(token) });
            setter((body.data && body.data.product) || product);
        } catch (err) {
            pushToast(err.message, 'error');
            setter(product);
        }
    };

    const deleteProduct = async (product) => {
        if (!confirm(`Delete ${product.name}?`)) return;
        try {
            await window.MP.apiJSON(`${window.MP.config.productsPath}/${window.MP.productId(product)}`, {
                method: 'DELETE',
                headers: window.MP.authHeaders(token),
            });
            pushToast('Product deleted', 'success');
            refreshAll();
        } catch (err) {
            pushToast(err.message, 'error');
        }
    };

    const heading = view === 'top' ? 'Top 3 cheapest products' : view === 'analytics' ? 'Product category aggregation' : view === 'admin' ? 'Admin tools' : filters.category || 'Popular today';
    const helper = view === 'analytics' ? 'Category summaries for products below 1000.' : view === 'top' ? 'A focused look at the lowest-priced products.' : 'Browse products from the marketplace database.';

    return (
        <div className="page-shell">
            <TopBar auth={auth} search={search} setSearch={setSearch} onOpenAccount={() => setShowAccount(true)} onLogout={auth.logout} onRefresh={refreshAll} />
            <ViewTabs view={view} setView={setView} canManage={canManage} />

            <div className="app-frame">
                <Sidebar categories={categoryCounts} activeCategory={filters.category} setCategory={setCategory} totalProducts={catalog.length} stats={stats} />
                <main className="content space-y-5">
                    <section className="panel heading-panel">
                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="badge badge-primary badge-outline">Database products</span>
                                <span className="badge badge-ghost">Premium items hidden</span>
                                {filters.category && <span className="badge badge-secondary">{filters.category}</span>}
                            </div>
                            <h1>{heading}</h1>
                            <p className="mt-2 text-sm text-slate-500">{helper}</p>
                        </div>
                        {canManage && view !== 'analytics' && (
                            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                                <Icon name="plus" />
                                Add product
                            </button>
                        )}
                    </section>

                    {view !== 'analytics' && view !== 'admin' && (
                        <QueryControls filters={filters} setFilters={setFilters} onClear={clearFilters} resultCount={search.trim() ? visibleProducts.length : resultCount} view={view} />
                    )}

                    {view === 'analytics' ? (
                        <AnalyticsPanel stats={stats} loading={loadingStats} />
                    ) : view === 'admin' ? (
                        <AdminPanel products={catalog} canManage={canManage} onCreate={() => setShowCreate(true)} onEdit={(product) => openProduct(product, setFormProduct)} onDelete={deleteProduct} />
                    ) : (
                        <ProductGrid products={visibleProducts} loading={loadingProducts} canManage={canManage} onOpen={(product) => openProduct(product, setDetailProduct)} onEdit={(product) => openProduct(product, setFormProduct)} onDelete={deleteProduct} />
                    )}
                </main>
            </div>

            {(showCreate || formProduct) && (
                <ProductForm
                    product={formProduct}
                    token={token}
                    toast={toast}
                    categoryOptions={categoryOptions}
                    onClose={() => {
                        setShowCreate(false);
                        setFormProduct(null);
                    }}
                    onSaved={refreshAll}
                />
            )}
            {detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />}
            {showAccount && <AccountModal auth={auth} toast={toast} onClose={() => setShowAccount(false)} />}
        </div>
    );
}

function App() {
    const auth = window.MP.useAuth();
    const toast = window.MP.useToast();

    if (auth.checking) {
        return (
            <>
                <LoadingScreen />
                <Toasts toasts={toast.toasts} />
            </>
        );
    }

    return (
        <>
            {auth.user ? <Dashboard auth={auth} toast={toast} /> : <AuthPanel auth={auth} toast={toast} />}
            <Toasts toasts={toast.toasts} />
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
