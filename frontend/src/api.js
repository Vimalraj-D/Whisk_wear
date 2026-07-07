import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getAuthHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=400';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
  const backendHost = API_URL.replace('/api', '');
  return `${backendHost}${url}`;
};

export const apiService = {
  // ─── Admin ───
  adminLogin: async (username, password) => {
    const r = await api.post('/auth/admin/login', { username, password });
    return r.data;
  },

  // ─── 3-Step Signup ───
  userInitiate: async (name, email) => {
    const r = await api.post('/auth/user/initiate', { name, email });
    return r.data;
  },
  userVerify: async (email, code) => {
    const r = await api.post('/auth/user/verify', { email, code });
    return r.data;
  },
  userComplete: async (email, password) => {
    const r = await api.post('/auth/user/complete', { email, password });
    return r.data;
  },
  resendVerificationCode: async (email) => {
    const r = await api.post('/auth/user/resend-code', { email });
    return r.data;
  },

  // ─── Login (existing users) ───
  userLogin: async (email, password) => {
    const r = await api.post('/auth/user/login', { email, password });
    return r.data;
  },

  // ─── Categories ───
  getCategories: async () => api.get('/categories'),
  createCategory: async (data, token) => api.post('/categories', data, getAuthHeaders(token)),
  updateCategory: async (id, data, token) => api.put(`/categories/${id}`, data, getAuthHeaders(token)),
  deleteCategory: async (id, token) => api.delete(`/categories/${id}`, getAuthHeaders(token)),
  getSubcategories: async () => api.get('/categories/subcategories'),
  createSubcategory: async (name, category_id, token) => api.post('/categories/subcategories', { name, category_id }, getAuthHeaders(token)),
  updateSubcategory: async (id, name, token) => api.put(`/categories/subcategories/${id}`, { name }, getAuthHeaders(token)),
  deleteSubcategory: async (id, token) => api.delete(`/categories/subcategories/${id}`, getAuthHeaders(token)),

  // ─── Products ───
  getProducts: async (category) => {
    const r = await api.get('/products', {
      params: category ? { category } : {},
    });
    return r.data;
  },
  getProduct: async (id) => {
    const r = await api.get(`/products/${id}`);
    return r.data;
  },
  createProduct: async (productData, token) => {
    const r = await api.post('/products', productData, getAuthHeaders(token));
    return r.data;
  },
  updateProduct: async (id, productData, token) => {
    const r = await api.put(`/products/${id}`, productData, getAuthHeaders(token));
    return r.data;
  },
  deleteProduct: async (id, token) => {
    const r = await api.delete(`/products/${id}`, getAuthHeaders(token));
    return r.data;
  },

  // ─── Products with image upload ───
  createProductWithImages: async (productData, images, token) => {
    const form = new FormData();
    Object.entries(productData).forEach(([k, v]) => form.append(k, v));
    images.forEach(img => form.append('images', img));
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
    const r = await api.post('/products', form, { headers });
    return r.data;
  },
  updateProductWithImages: async (id, productData, images, token) => {
    const form = new FormData();
    Object.entries(productData).forEach(([k, v]) => form.append(k, v));
    images.forEach(img => form.append('images', img));
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
    const r = await api.put(`/products/${id}`, form, { headers });
    return r.data;
  },

  // ─── Analytics ───
  getRevenueStats: async (token) => api.get('/analytics/revenue', getAuthHeaders(token)),
  getOrderStats: async (token) => api.get('/analytics/orders', getAuthHeaders(token)),
  getTopProducts: async (token) => api.get('/analytics/top-products', getAuthHeaders(token)),

  // ─── Orders ───
  placeOrder: async (orderData, userToken = null) => {
    const headers = userToken ? getAuthHeaders(userToken).headers : {};
    const r = await api.post('/orders', orderData, { headers });
    return r.data;
  },
  getOrders: async (token) => {
    const r = await api.get('/orders', getAuthHeaders(token));
    return r.data;
  },
  getMyOrders: async (token) => {
    const r = await api.get('/orders/my-orders', getAuthHeaders(token));
    return r.data;
  },
  updateOrderStatus: async (id, status, token) => {
    const r = await api.put(`/orders/${id}`, { status }, getAuthHeaders(token));
    return r.data;
  },
};
