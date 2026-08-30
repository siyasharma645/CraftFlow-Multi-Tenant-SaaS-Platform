import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('craftflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('craftflow_token');
      localStorage.removeItem('craftflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/orders/dashboard').then(r => r.data),
  productionQueue: () => api.get('/orders/production-queue').then(r => r.data),
};

// ─── Orders ────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: (params) => api.get('/orders', { params }).then(r => r.data),
  get: (id) => api.get(`/orders/${id}`).then(r => r.data),
  create: (data) => api.post('/orders', data).then(r => r.data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data).then(r => r.data),
};

// ─── Products ──────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params) => api.get('/products', { params }).then(r => r.data),
  get: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`).then(r => r.data),
  lowStock: () => api.get('/products/low-stock').then(r => r.data),
};

// ─── Customers ─────────────────────────────────────────────────────────────
export const customersApi = {
  list: (params) => api.get('/customers', { params }).then(r => r.data),
  get: (id) => api.get(`/customers/${id}`).then(r => r.data),
  create: (data) => api.post('/customers', data).then(r => r.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then(r => r.data),
};

// ─── Inventory ─────────────────────────────────────────────────────────────
export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }).then(r => r.data),
  create: (data) => api.post('/inventory', data).then(r => r.data),
  adjust: (id, data) => api.post(`/inventory/${id}/transactions`, data).then(r => r.data),
  lowStock: () => api.get('/inventory/low-stock').then(r => r.data),
};

// ─── Categories ────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  create: (data) => api.post('/categories', data).then(r => r.data),
  delete: (id) => api.delete(`/categories/${id}`).then(r => r.data),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markAllRead: () => api.post('/notifications/mark-all-read').then(r => r.data),
};
