const BASE = 'https://dummyjson.com';
const JP = 'https://jsonplaceholder.typicode.com'; // blog, comments and contact form

// Small in-memory cache for GET requests (60s) so revisiting a page or category list is instant.
const cache = new Map();
const TTL = 60_000;

async function request(path, options = {}, base = BASE) {
  const isGet = !options.method || options.method === 'GET';
  const useCache = isGet && !options.headers;
  if (useCache) {
    const hit = cache.get(base + path);
    if (hit && Date.now() - hit.t < TTL) return hit.data;
  }
  let res;
  try {
    res = await fetch(base + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('Network error. Check your internet connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  if (useCache) cache.set(base + path, { t: Date.now(), data });
  return data;
}

export const PAGE_SIZE = 12;

/**
 * Products list: plain, search, category, or search + category, always with pagination + sortBy/order.
 * DummyJSON cannot search inside a category, so for that case we fetch all search matches
 * (limit=0) and filter/paginate them here.
 */
export async function getProducts({ q = '', category = '', sortBy = '', order = 'asc', page = 1, limit = PAGE_SIZE }) {
  if (q && category) {
    const a = new URLSearchParams({ q, limit: 0 });
    if (sortBy) {
      a.set('sortBy', sortBy);
      a.set('order', order);
    }
    const data = await request(`/products/search?${a}`);
    const all = data.products.filter((x) => x.category === category);
    const skip = (page - 1) * limit;
    return { products: all.slice(skip, skip + limit), total: all.length, skip, limit };
  }
  const p = new URLSearchParams({ limit, skip: (page - 1) * limit });
  if (sortBy) {
    p.set('sortBy', sortBy);
    p.set('order', order);
  }
  if (q) {
    p.set('q', q);
    return request(`/products/search?${p}`);
  }
  if (category) return request(`/products/category/${encodeURIComponent(category)}?${p}`);
  return request(`/products?${p}`);
}

export const getProduct = (id) => request(`/products/${id}`);
export const getCategories = () => request('/products/categories');
export const getDemoUsers = (limit = 6) =>
  request(`/users?limit=${limit}&select=username,password,firstName,lastName,image`);

export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
export const refreshSession = (refreshToken) =>
  request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken, expiresInMins: 60 }) });
export const getMe = (token) => request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
export const getUserCarts = (id) => request(`/carts/user/${id}`);
export const submitCart = (userId, products) =>
  request('/carts/add', { method: 'POST', body: JSON.stringify({ userId, products }) });

// ---- JSONPlaceholder (https://jsonplaceholder.typicode.com) ----
const jp = (path, options) => request(path, options, JP);
export const getPosts = () => jp('/posts');
export const getPost = (id) => jp(`/posts/${id}`);
export const getPostComments = (id) => jp(`/posts/${id}/comments`);
export const getBlogUsers = () => jp('/users');
export const getBlogUser = (id) => jp(`/users/${id}`);
// Writes are faked by the API (not saved), but the response shape is real.
export const addComment = (comment) => jp('/comments', { method: 'POST', body: JSON.stringify(comment) });
export const sendMessage = (post) => jp('/posts', { method: 'POST', body: JSON.stringify(post) });
