import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cf_token')
      localStorage.removeItem('cf_user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to do this.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
}

// ── Dashboard ─────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/orders/dashboard'),
}

// ── Orders ────────────────────────────────────────────────
export const ordersApi = {
  list: (params?: any) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  queue: () => api.get('/orders/queue'),
}

// ── Products ──────────────────────────────────────────────
export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  lowStock: () => api.get('/products/low-stock'),
}

// ── Customers ─────────────────────────────────────────────
export const customersApi = {
  list: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
}

// ── Inventory ─────────────────────────────────────────────
export const inventoryApi = {
  list: (params?: any) => api.get('/inventory', { params }),
  lowStock: () => api.get('/inventory/low-stock'),
  create: (data: any) => api.post('/inventory', data),
  adjust: (id: string, data: any) => api.post(`/inventory/${id}/transactions`, data),
}

// ── Notifications ─────────────────────────────────────────
export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/mark-all-read'),
}
