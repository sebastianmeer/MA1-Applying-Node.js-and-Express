const API_ROOT = '/api/v1';

export function getToken() {
  return localStorage.getItem('marketplaceToken') || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('marketplaceToken', token);
  } else {
    localStorage.removeItem('marketplaceToken');
  }
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || 'Request failed');
  }

  return body;
}

export const authApi = {
  login: (payload) => api('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => api('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => api('/auth/forgotPassword', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (token, payload) => api(`/auth/resetPassword/${token}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  me: () => api('/auth/me'),
  updateMe: (payload) => api('/auth/updateMe', { method: 'PATCH', body: JSON.stringify(payload) }),
  updatePassword: (payload) => api('/auth/updateMyPassword', { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMe: () => api('/auth/deleteMe', { method: 'DELETE' }),
  logout: () => api('/auth/logout'),
};

export const productApi = {
  list: (query = '') => api(`/products${query}`),
  topCheap: () => api('/products/top-3-cheapest'),
  stats: () => api('/products/product-category'),
  create: (payload) => api('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};
