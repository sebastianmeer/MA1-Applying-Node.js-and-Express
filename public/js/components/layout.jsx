function TopBar({ auth, search, setSearch, onOpenAccount, onLogout, onRefresh }) {
    return (
        <header className="app-topbar">
            <div className="topbar-inner">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="brand-mark">
                        <Icon name="logo" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ecommerce</p>
                        <p className="truncate text-lg font-extrabold">Local Marketplace</p>
                    </div>
                </div>

                <label className="search-control">
                    <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, seller, or category" />
                    <Icon name="funnel" className="h-4 w-4 shrink-0 text-slate-400" />
                </label>

                <div className="top-actions">
                    <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 xl:flex">
                        <Icon name="mapPin" className="h-4 w-4 text-primary" />
                        Delivery area
                    </div>
                    <button className="btn btn-ghost btn-square" title="Refresh data" onClick={onRefresh}>
                        <Icon name="arrowPath" />
                    </button>
                    <button className="btn btn-ghost" onClick={onOpenAccount}>
                        <Icon name="user" />
                        <span className="hidden sm:inline">{auth.user.name}</span>
                        <span className="badge badge-outline">{auth.user.role}</span>
                    </button>
                    <button className="btn btn-outline" onClick={onLogout}>
                        <Icon name="logout" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

function ViewTabs({ view, setView, canManage }) {
    const tabs = [
        { id: 'browse', label: 'Home', icon: 'home' },
        { id: 'top', label: 'Top 3 Cheap', icon: 'tag' },
        { id: 'analytics', label: 'Aggregation', icon: 'chartBar' },
        ...(canManage ? [{ id: 'admin', label: 'Admin', icon: 'shield' }] : []),
    ];

    return (
        <nav className="app-nav">
            <div className="nav-inner">
                {tabs.map((tab) => (
                    <button key={tab.id} className={`nav-button ${view === tab.id ? 'is-active' : ''}`} onClick={() => setView(tab.id)}>
                        <Icon name={tab.icon} className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}

function Sidebar({ categories, activeCategory, setCategory, totalProducts, stats }) {
    const aggregateCategories = new Set(stats.map((item) => item.category));

    return (
        <aside className="sidebar">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-extrabold text-primary">Recommended</h2>
                <span className="badge badge-ghost">{totalProducts}</span>
            </div>
            <button className={`category-button ${!activeCategory ? 'is-active' : ''}`} onClick={() => setCategory('')}>
                <span className="flex min-w-0 items-center gap-2">
                    <Icon name="home" className="h-4 w-4 shrink-0" />
                    <span className="truncate">All Products</span>
                </span>
                <span className="text-xs">{totalProducts}</span>
            </button>

            {categories.map((item, index) => (
                <button key={item.name} className={`category-button ${activeCategory === item.name ? 'is-active' : ''}`} onClick={() => setCategory(item.name)}>
                    <span className="flex min-w-0 items-center gap-2">
                        <Icon name={index % 3 === 0 ? 'shoppingBag' : index % 3 === 1 ? 'tag' : 'chartBar'} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                    </span>
                    <span className={`text-xs ${aggregateCategories.has(item.name) ? 'font-bold text-secondary' : 'text-slate-400'}`}>{item.count}</span>
                </button>
            ))}
        </aside>
    );
}

function QueryControls({ filters, setFilters, onClear, resultCount, view }) {
    const update = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            ...(field !== 'page' ? { page: '1' } : {}),
        }));
    };

    return (
        <section className="panel query-panel">
            <div className="query-head">
                <div className="flex items-center gap-3">
                    <Icon name="adjustments" className="h-7 w-7 text-primary" />
                    <div>
                        <h2 className="font-extrabold leading-tight">Product Filters</h2>
                        <p className="text-sm text-slate-500">Sort, field selection, price range, and pagination</p>
                    </div>
                </div>
                <div className="badge badge-outline">{view === 'top' ? 'Alias route' : `${resultCount} result${resultCount === 1 ? '' : 's'}`}</div>
            </div>

            <div className="query-grid">
                <label className="field">
                    <span className="label-text">Sort</span>
                    <select className="select select-bordered w-full" value={filters.sort} onChange={(event) => update('sort', event.target.value)} disabled={view === 'top'}>
                        {window.MP.config.sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </label>
                <label className="field">
                    <span className="label-text">Fields</span>
                    <select className="select select-bordered w-full" value={filters.fields} onChange={(event) => update('fields', event.target.value)} disabled={view === 'top'}>
                        {window.MP.config.fieldOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                    </select>
                </label>
                <label className="field">
                    <span className="label-text">Min price</span>
                    <input className="input input-bordered w-full" type="number" min="0" value={filters.minPrice} onChange={(event) => update('minPrice', event.target.value)} disabled={view === 'top'} />
                </label>
                <label className="field">
                    <span className="label-text">Max price</span>
                    <input className="input input-bordered w-full" type="number" min="0" value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} disabled={view === 'top'} />
                </label>
                <label className="field">
                    <span className="label-text">Limit</span>
                    <select className="select select-bordered w-full" value={filters.limit} onChange={(event) => update('limit', event.target.value)} disabled={view === 'top'}>
                        {window.MP.config.pageLimits.map((limit) => <option key={limit} value={limit}>{limit}</option>)}
                    </select>
                </label>
                <div className="field">
                    <span className="label-text">Page</span>
                    <div className="page-control join">
                        <button className="btn join-item" type="button" disabled={view === 'top' || Number(filters.page) <= 1} onClick={() => update('page', String(Math.max(1, Number(filters.page) - 1)))}>
                            <Icon name="chevronLeft" className="h-4 w-4" />
                        </button>
                        <input className="input input-bordered join-item w-full text-center" type="number" min="1" value={filters.page} onChange={(event) => update('page', event.target.value || '1')} disabled={view === 'top'} />
                        <button className="btn join-item" type="button" disabled={view === 'top'} onClick={() => update('page', String(Number(filters.page || 1) + 1))}>
                            <Icon name="chevronRight" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button className="btn btn-ghost" onClick={onClear} disabled={view === 'top'}>Clear filters</button>
            </div>
        </section>
    );
}

window.TopBar = TopBar;
window.ViewTabs = ViewTabs;
window.Sidebar = Sidebar;
window.QueryControls = QueryControls;
