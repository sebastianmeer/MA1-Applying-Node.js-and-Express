const API_AUTH = '/api/auth';
const API_PRODUCTS = '/api/products';
const FALLBACK_IMAGE = 'https://placehold.co/640x480/e5e7eb/64748b?text=Product';

const state = {
    token: '',
    user: null,
    products: [],
    stats: [],
};

const icon = {
    logo: '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0h7.5m-10.5 0H3.375A1.125 1.125 0 0 1 2.25 17.625V14.25m19.5 4.5h-1.125A1.125 1.125 0 0 1 19.5 17.625V11.25a3.375 3.375 0 0 0-.99-2.386L16.396 6.75A3.375 3.375 0 0 0 14.01 5.76H4.125A1.125 1.125 0 0 0 3 6.885v7.365h18.75"/></svg>',
    plus: '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>',
};

function $(selector) {
    return document.querySelector(selector);
}

function toast(message, type = 'info') {
    const box = $('#toast');
    box.className = `alert ${type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info'} fixed bottom-4 right-4 z-50 w-auto max-w-sm shadow-lg`;
    box.textContent = message;
    box.classList.remove('hide');
    setTimeout(() => box.classList.add('hide'), 3200);
}

function productImage(product) {
    const image = product.image || FALLBACK_IMAGE;

    if (/^https?:\/\//.test(image)) {
        return `<img class="product-image" src="${image}" alt="${product.name}" onerror="this.src='${FALLBACK_IMAGE}'">`;
    }

    return `<div class="product-image product-emoji" aria-label="${product.name}">${image}</div>`;
}

async function apiJSON(path, options = {}) {
    const res = await fetch(path, {
        credentials: 'include',
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (res.status === 204) return {};
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.message || 'Request failed');
    return body;
}

function showApp(isLoggedIn) {
    $('#auth-page').classList.toggle('hide', isLoggedIn);
    $('#app-page').classList.toggle('hide', !isLoggedIn);
}

function renderUser() {
    $('#user-name').textContent = state.user ? state.user.name : '';
    $('#user-role').textContent = state.user ? state.user.role : '';
    $('#admin-panel').classList.toggle('hide', !state.user || state.user.role !== 'admin');
}

function renderProducts() {
    const grid = $('#products');
    grid.innerHTML = state.products.map((product) => `
        <article class="panel product-card">
            ${productImage(product)}
            <div class="p-4">
                <div class="mb-2 flex items-start justify-between gap-2">
                    <h3 class="font-bold">${product.name}</h3>
                    <span class="badge badge-primary badge-outline">${product.category}</span>
                </div>
                <p class="min-h-10 text-sm text-slate-500">${product.description || 'No description'}</p>
                <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div class="rounded bg-slate-50 p-2"><p class="text-slate-400">Price</p><p class="font-bold">PHP ${product.price}</p></div>
                    <div class="rounded bg-slate-50 p-2"><p class="text-slate-400">Seller</p><p class="font-bold">${product.seller || '-'}</p></div>
                    <div class="rounded bg-slate-50 p-2"><p class="text-slate-400">Qty</p><p class="font-bold">${product.quantity || '-'}</p></div>
                </div>
                <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    ${product.priceDiscount ? `<span class="badge badge-outline">Discount PHP ${product.priceDiscount}</span>` : ''}
                    ${product.daysPosted !== undefined ? `<span class="badge badge-outline">${product.daysPosted} days posted</span>` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

function renderStats() {
    const table = $('#stats');
    table.innerHTML = state.stats.map((item) => `
        <tr>
            <td class="font-bold">${item.category}</td>
            <td>${item.numProducts}</td>
            <td>PHP ${item.avgPrice}</td>
            <td>PHP ${item.minPrice}</td>
            <td>PHP ${item.maxPrice}</td>
        </tr>
    `).join('');
}

async function loadData() {
    const [productsBody, statsBody] = await Promise.all([
        apiJSON(API_PRODUCTS),
        apiJSON(`${API_PRODUCTS}/product-category`),
    ]);

    state.products = productsBody.data.products;
    state.stats = statsBody.data.stats;
    renderProducts();
    renderStats();
}

async function restoreSession() {
    try {
        const body = await apiJSON(`${API_AUTH}/me`);
        state.user = body.data.user;
        showApp(true);
        renderUser();
        await loadData();
    } catch (err) {
        showApp(false);
    }
}

$('#auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const mode = $('#auth-mode').checked ? 'signup' : 'login';
    const payload = {
        email: $('#email').value,
        password: $('#password').value,
    };

    if (mode === 'signup') {
        payload.name = $('#name').value;
        payload.passwordConfirm = $('#password-confirm').value || payload.password;
        payload.role = $('#role').value;
    }

    try {
        const body = await apiJSON(`${API_AUTH}/${mode}`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        state.token = body.token;
        state.user = body.user;
        showApp(true);
        renderUser();
        await loadData();
        toast(mode === 'signup' ? 'Account created' : 'Logged in', 'success');
    } catch (err) {
        toast(err.message, 'error');
    }
});

$('#auth-mode').addEventListener('change', (event) => {
    const signup = event.target.checked;
    $('#signup-fields').classList.toggle('hide', !signup);
    $('#submit-label').textContent = signup ? 'Create account' : 'Login';
});

$('#logout').addEventListener('click', async () => {
    await apiJSON(`${API_AUTH}/logout`).catch(() => {});
    state.token = '';
    state.user = null;
    showApp(false);
});

$('#refresh').addEventListener('click', () => loadData().catch((err) => toast(err.message, 'error')));

$('#create-product').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    Object.keys(payload).forEach((key) => {
        if (payload[key] === '') delete payload[key];
    });
    payload.organic = new FormData(event.target).has('organic');
    payload.premiumProducts = new FormData(event.target).has('premiumProducts');

    try {
        await apiJSON(API_PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        event.target.reset();
        await loadData();
        toast('Product created', 'success');
    } catch (err) {
        toast(err.message, 'error');
    }
});

document.querySelectorAll('.brand-icon').forEach((el) => {
    el.innerHTML = icon.logo;
});

restoreSession();
