function ProductForm({ product, token, toast, onClose, onSaved, categoryOptions }) {
    const [loading, setLoading] = React.useState(false);
    const [form, setForm] = React.useState(() => ({
        name: product ? product.name || '' : '',
        price: product ? product.price ?? '' : '',
        category: product ? product.category || '' : categoryOptions[0] || 'Electronics',
        description: product ? product.description || '' : '',
        rating: product ? product.rating ?? 4.5 : 4.5,
        seller: product ? product.seller || '' : '',
        postedDate: product && product.postedDate ? String(product.postedDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
        priceDiscount: product && product.priceDiscount !== undefined && product.priceDiscount !== null ? product.priceDiscount : '',
        image: product ? product.image || '' : '',
        premiumProducts: product ? Boolean(product.premiumProducts) : false,
    }));

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const submit = async (event) => {
        event.preventDefault();
        const price = Number(form.price);
        const discount = form.priceDiscount === '' ? undefined : Number(form.priceDiscount);

        if (!Number.isFinite(price) || price < 0) return toast.push('Price must be 0 or above.', 'error');
        if (discount !== undefined && (!Number.isFinite(discount) || discount >= price)) return toast.push('Discount must be below price.', 'error');
        if ((form.description || '').length > 50) return toast.push('Description must not exceed 50 characters.', 'error');

        setLoading(true);
        try {
            const payload = {
                name: form.name.trim(),
                price,
                category: form.category.trim(),
                description: form.description.trim(),
                rating: Number(form.rating),
                seller: form.seller.trim(),
                postedDate: form.postedDate,
                premiumProducts: Boolean(form.premiumProducts),
                image: form.image.trim() || undefined,
                priceDiscount: discount,
            };

            Object.keys(payload).forEach((key) => {
                if (payload[key] === undefined || payload[key] === '') delete payload[key];
            });

            await window.MP.apiJSON(product ? `${window.MP.config.productsPath}/${window.MP.productId(product)}` : window.MP.config.productsPath, {
                method: product ? 'PATCH' : 'POST',
                headers: window.MP.authHeaders(token),
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
            <div className="modal-box max-w-4xl">
                <button className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
                <div className="mb-5 flex items-center gap-3">
                    <div className="brand-mark bg-primary"><Icon name={product ? 'pencil' : 'plus'} /></div>
                    <div>
                        <h3 className="text-xl font-extrabold">{product ? 'Edit product' : 'Add product'}</h3>
                        <p className="text-sm text-slate-500">Validated before saving to the API.</p>
                    </div>
                </div>

                <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
                    <label className="field"><span className="label-text">Name</span><input className="input input-bordered w-full" value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
                    <label className="field"><span className="label-text">Seller</span><input className="input input-bordered w-full" value={form.seller} onChange={(event) => update('seller', event.target.value)} required /></label>
                    <label className="field"><span className="label-text">Price</span><input className="input input-bordered w-full" type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} required /></label>
                    <label className="field"><span className="label-text">Discount price</span><input className="input input-bordered w-full" type="number" min="0" step="0.01" value={form.priceDiscount} onChange={(event) => update('priceDiscount', event.target.value)} /></label>
                    <label className="field"><span className="label-text">Category</span><input className="input input-bordered w-full" list="category-options" value={form.category} onChange={(event) => update('category', event.target.value)} required /></label>
                    <label className="field"><span className="label-text">Rating</span><input className="input input-bordered w-full" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(event) => update('rating', event.target.value)} /></label>
                    <label className="field"><span className="label-text">Posted date</span><input className="input input-bordered w-full" type="date" value={form.postedDate} onChange={(event) => update('postedDate', event.target.value)} required /></label>
                    <label className="field"><span className="label-text">Image URL</span><input className="input input-bordered w-full" value={form.image} onChange={(event) => update('image', event.target.value)} /></label>
                    <label className="field md:col-span-2">
                        <span className="label-text">Description</span>
                        <input className="input input-bordered w-full" maxLength="50" value={form.description} onChange={(event) => update('description', event.target.value)} />
                        <span className="text-xs text-slate-400">{form.description.length}/50</span>
                    </label>
                    <datalist id="category-options">{categoryOptions.map((category) => <option key={category} value={category} />)}</datalist>
                    <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
                        <input type="checkbox" className="toggle toggle-primary" checked={form.premiumProducts} onChange={(event) => update('premiumProducts', event.target.checked)} />
                        <span className="label-text">Premium product</span>
                    </label>
                    <div className="modal-action md:col-span-2">
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" disabled={loading}>{loading && <span className="loading loading-spinner loading-sm" />}Save product</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}

function ProductDetailModal({ product, onClose }) {
    if (!product) return null;
    const postedDays = product.daysPosted !== undefined ? product.daysPosted : window.MP.daysSince(product.postedDate);

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <button className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
                <div className="grid gap-5 md:grid-cols-[16rem_1fr]">
                    <img src={product.image || window.MP.config.placeholderImage} alt={product.name} className="aspect-square w-full rounded-lg object-cover" onError={(event) => { event.currentTarget.src = window.MP.config.placeholderImage; }} />
                    <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                            <span className="badge badge-primary badge-outline">{product.category}</span>
                            {product.productSlug && <span className="badge badge-ghost">{product.productSlug}</span>}
                        </div>
                        <h3 className="text-2xl font-extrabold">{product.name}</h3>
                        <p className="mt-2 text-slate-500">{product.description || 'No description provided.'}</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-400">Price</p><p className="text-lg font-extrabold">{window.MP.formatPrice(product.priceDiscount || product.price)}</p></div>
                            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-400">Seller</p><p className="font-bold">{product.seller}</p></div>
                            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-400">Rating</p><p className="font-bold">{product.rating || '-'}</p></div>
                            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-400">Days posted</p><p className="font-bold">{postedDays !== null ? postedDays : '-'}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

function AccountModal({ auth, toast, onClose }) {
    const [profile, setProfile] = React.useState({ name: auth.user.name || '', email: auth.user.email || '' });
    const [passwords, setPasswords] = React.useState({ passwordCurrent: '', password: '', passwordConfirm: '' });
    const [loading, setLoading] = React.useState('');

    const updateProfile = async () => {
        setLoading('profile');
        try {
            const body = await window.MP.apiJSON(`${window.MP.config.authPath}/updateMe`, {
                method: 'PATCH',
                headers: window.MP.authHeaders(auth.token),
                body: JSON.stringify(profile),
            });
            auth.setUser(window.MP.getUser(body));
            toast.push('Profile updated', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        } finally {
            setLoading('');
        }
    };

    const updatePassword = async () => {
        setLoading('password');
        try {
            const body = await window.MP.apiJSON(`${window.MP.config.authPath}/updateMyPassword`, {
                method: 'PATCH',
                headers: window.MP.authHeaders(auth.token),
                body: JSON.stringify(passwords),
            });
            auth.login(body.token, window.MP.getUser(body));
            setPasswords({ passwordCurrent: '', password: '', passwordConfirm: '' });
            toast.push('Password updated', 'success');
        } catch (err) {
            toast.push(err.message, 'error');
        } finally {
            setLoading('');
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl">
                <button className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3" onClick={onClose}><Icon name="x" className="h-4 w-4" /></button>
                <h3 className="mb-5 text-xl font-extrabold">Current user</h3>
                <div className="grid gap-5 md:grid-cols-2">
                    <section className="panel p-4">
                        <h4 className="font-extrabold">Details</h4>
                        <div className="mt-4 space-y-3">
                            <input className="input input-bordered w-full" value={profile.name} onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))} />
                            <input className="input input-bordered w-full" type="email" value={profile.email} onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))} />
                            <button className="btn btn-primary w-full" onClick={updateProfile} disabled={loading === 'profile'}>{loading === 'profile' && <span className="loading loading-spinner loading-sm" />}Save details</button>
                        </div>
                    </section>
                    <section className="panel p-4">
                        <h4 className="font-extrabold">Password</h4>
                        <div className="mt-4 space-y-3">
                            <input className="input input-bordered w-full" type="password" placeholder="Current password" value={passwords.passwordCurrent} onChange={(event) => setPasswords((prev) => ({ ...prev, passwordCurrent: event.target.value }))} />
                            <input className="input input-bordered w-full" type="password" placeholder="New password" value={passwords.password} onChange={(event) => setPasswords((prev) => ({ ...prev, password: event.target.value }))} />
                            <input className="input input-bordered w-full" type="password" placeholder="Confirm new password" value={passwords.passwordConfirm} onChange={(event) => setPasswords((prev) => ({ ...prev, passwordConfirm: event.target.value }))} />
                            <button className="btn btn-secondary w-full" onClick={updatePassword} disabled={loading === 'password'}>{loading === 'password' && <span className="loading loading-spinner loading-sm" />}Change password</button>
                        </div>
                    </section>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </dialog>
    );
}

window.ProductForm = ProductForm;
window.ProductDetailModal = ProductDetailModal;
window.AccountModal = AccountModal;
