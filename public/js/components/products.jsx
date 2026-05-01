function ProductCard({ product, canManage, onOpen, onEdit, onDelete }) {
    const price = Number(product.price || 0);
    const discountPrice = product.priceDiscount !== undefined && product.priceDiscount !== null ? Number(product.priceDiscount) : null;
    const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price;
    const displayPrice = hasDiscount ? discountPrice : price;
    const postedDays = product.daysPosted !== undefined ? product.daysPosted : window.MP.daysSince(product.postedDate);

    return (
        <article className="product-card">
            <button className="btn btn-square btn-sm absolute right-3 top-3 z-10 bg-white/95 shadow-sm" title="View product" onClick={() => onOpen(product)}>
                <Icon name="eye" className="h-4 w-4" />
            </button>
            <figure className="product-image">
                <img
                    src={product.image || window.MP.config.placeholderImage}
                    alt={product.name || 'Product'}
                    onError={(event) => {
                        event.currentTarget.src = window.MP.config.placeholderImage;
                    }}
                />
            </figure>
            <div className="product-body">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-lg font-extrabold text-slate-950">{window.MP.formatPrice(displayPrice)}</p>
                        {hasDiscount && <p className="text-xs text-slate-400 line-through">{window.MP.formatPrice(price)}</p>}
                    </div>
                    <span className="badge badge-primary badge-outline max-w-[8rem] truncate">{product.category || 'Category'}</span>
                </div>

                <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-slate-950">{product.name || 'Unnamed product'}</h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{product.description || 'No description provided.'}</p>
                </div>

                <div className="product-metrics text-xs">
                    <div className="product-metric">
                        <p className="text-slate-400">Seller</p>
                        <p className="truncate font-bold text-slate-700">{product.seller || '-'}</p>
                    </div>
                    <div className="product-metric">
                        <p className="text-slate-400">Rating</p>
                        <p className="font-bold text-slate-700">{product.rating || '-'}</p>
                    </div>
                    <div className="product-metric">
                        <p className="text-slate-400">Posted</p>
                        <p className="font-bold text-slate-700">{postedDays !== null ? `${postedDays}d` : '-'}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="tooltip max-w-[9rem]" data-tip={product.productSlug || 'Slug is generated on save'}>
                        <span className="badge badge-ghost truncate">{product.productSlug || 'SLUG'}</span>
                    </div>
                    {canManage && (
                        <div className="join">
                            <button className="btn join-item btn-sm" type="button" title="Edit product" onClick={() => onEdit(product)}>
                                <Icon name="pencil" className="h-4 w-4" />
                            </button>
                            <button className="btn btn-error join-item btn-sm" type="button" title="Delete product" onClick={() => onDelete(product)}>
                                <Icon name="trash" className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function ProductGrid({ products, loading, canManage, onOpen, onEdit, onDelete }) {
    if (loading) {
        return (
            <div className="empty-state">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="empty-state p-6 text-center">
                <div>
                    <Icon name="search" className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-3 font-extrabold">No matching products</h3>
                    <p className="mt-1 text-sm text-slate-500">No records matched the current product set.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard key={window.MP.productId(product)} product={product} canManage={canManage} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}

function AnalyticsPanel({ stats, loading }) {
    if (loading) {
        return (
            <div className="empty-state">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!stats.length) {
        return (
            <div className="panel p-6">
                <div className="alert">
                    <Icon name="chartBar" />
                    <span>No category aggregation rows are available yet.</span>
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                {stats.slice(0, 3).map((item) => (
                    <div key={item.category} className="panel p-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-extrabold text-slate-800">{item.category}</p>
                            <span className="badge badge-secondary">{item.numProducts}</span>
                        </div>
                        <p className="mt-4 text-2xl font-extrabold">{window.MP.formatPrice(item.avgPrice)}</p>
                        <p className="text-sm text-slate-500">Average below 1000</p>
                    </div>
                ))}
            </div>

            <div className="panel table-panel">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Products</th>
                                <th>Average</th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                                <th>Included products</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((item) => (
                                <tr key={item.category}>
                                    <td className="font-bold">{item.category}</td>
                                    <td>{item.numProducts}</td>
                                    <td>{window.MP.formatPrice(item.avgPrice)}</td>
                                    <td>{window.MP.formatPrice(item.minPrice)}</td>
                                    <td>{window.MP.formatPrice(item.maxPrice)}</td>
                                    <td>
                                        <div className="flex max-w-md flex-wrap gap-1">
                                            {(item.products || []).map((product) => (
                                                <span key={product.id || product.name} className="badge badge-ghost">{product.name}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function AdminPanel({ products, canManage, onCreate, onEdit, onDelete }) {
    if (!canManage) {
        return (
            <div className="panel p-6">
                <div className="alert alert-warning">
                    <Icon name="shield" />
                    <span>Admin access is required for product creation, updates, and deletion.</span>
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="panel heading-panel">
                <div>
                    <h2 className="text-xl font-extrabold">Product management</h2>
                    <p className="text-sm text-slate-500">Create, update, and delete database products.</p>
                </div>
                <button className="btn btn-primary" onClick={onCreate}>
                    <Icon name="plus" />
                    Add product
                </button>
            </div>
            <div className="panel table-panel">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Seller</th>
                                <th>Price</th>
                                <th>Posted</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={window.MP.productId(product)}>
                                    <td className="font-bold">{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.seller}</td>
                                    <td>{window.MP.formatPrice(product.priceDiscount || product.price)}</td>
                                    <td>{product.daysPosted !== undefined ? `${product.daysPosted}d` : '-'}</td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button className="btn btn-sm" onClick={() => onEdit(product)}><Icon name="pencil" className="h-4 w-4" /></button>
                                            <button className="btn btn-error btn-sm" onClick={() => onDelete(product)}><Icon name="trash" className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

window.ProductGrid = ProductGrid;
window.AnalyticsPanel = AnalyticsPanel;
window.AdminPanel = AdminPanel;
