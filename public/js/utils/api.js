window.MP = window.MP || {};

window.MP.config = {
    apiRoot: window.__MARKETPLACE_API_ROOT__ || '',
    productsPath: '/api/products',
    authPath: '/api/auth',
    placeholderImage: 'https://placehold.co/640x480/e5e7eb/64748b?text=Product',
    categories: ['Electronics', 'Fashion', 'Books', 'Sports', 'Home & Garden', 'Furniture', 'Automotive', 'Beauty & Care'],
    sortOptions: [
        { value: '-createdAt', label: 'Newest' },
        { value: 'price', label: 'Price low to high' },
        { value: '-price', label: 'Price high to low' },
        { value: '-rating', label: 'Top rated' },
        { value: 'name', label: 'Name A-Z' },
    ],
    fieldOptions: [
        { value: '', label: 'Full cards' },
        { value: 'name,price,category,seller,postedDate,daysPosted,description,rating,image,priceDiscount,productSlug', label: 'Card fields' },
        { value: 'name,price,category,seller,postedDate,daysPosted', label: 'Core fields' },
        { value: 'name,price,category,rating,seller', label: 'Price list' },
    ],
    pageLimits: ['6', '9', '12', '18', '24'],
};

window.MP.authHeaders = function authHeaders(token, extra = {}) {
    return {
        ...extra,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

window.MP.apiJSON = async function apiJSON(path, options = {}) {
    const response = await fetch(`${window.MP.config.apiRoot}${path}`, {
        credentials: 'include',
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {}),
        },
    });

    if (response.status === 204) return { status: 'success', data: null };

    const text = await response.text();
    let body = {};
    if (text) {
        try {
            body = JSON.parse(text);
        } catch (err) {
            body = { message: text };
        }
    }

    if (!response.ok) {
        throw new Error(body.message || body.error || `Request failed with status ${response.status}`);
    }

    return body;
};

window.MP.getUser = function getUser(body) {
    return body.user || (body.data && body.data.user) || null;
};

window.MP.getProducts = function getProducts(body) {
    return (body.data && body.data.products) || body.products || [];
};

window.MP.getStats = function getStats(body) {
    return (body.data && body.data.stats) || body.stats || [];
};

window.MP.productId = function productId(product) {
    return product && (product._id || product.id);
};

window.MP.daysSince = function daysSince(dateValue) {
    if (!dateValue) return null;
    const time = new Date(dateValue).getTime();
    if (Number.isNaN(time)) return null;
    return Math.max(0, Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24)));
};

window.MP.formatPrice = function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 'PHP 0';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: number % 1 === 0 ? 0 : 2,
    }).format(number);
};
