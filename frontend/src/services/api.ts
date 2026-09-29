import axios from 'axios';
import { ApiResponse, AuthResponse, Product, Category, Cart, Order, OrderTimeline, NotificationItem, Page } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userId = localStorage.getItem('userId') || 'user-demo-123';
  config.headers['X-User-Id'] = userId;
  return config;
});

export const authApi = {
  login: async (email: string, password: string):Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (firstName: string, lastName: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post('/auth/register', { firstName, lastName, email, password });
    return res.data;
  },
};

export const catalogApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await api.get('/categories');
    return res.data;
  },
  getProducts: async (params?: { categoryId?: string; search?: string; page?: number; size?: number; sort?: string }): Promise<ApiResponse<Page<Product>>> => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
};

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const res = await api.get('/cart');
    return res.data;
  },
  addItem: async (productId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data;
  },
  updateQuantity: async (productId: string, quantity: number): Promise<ApiResponse<Cart>> => {
    const res = await api.put(`/cart/items/${productId}`, { quantity });
    return res.data;
  },
  removeItem: async (productId: string): Promise<ApiResponse<Cart>> => {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data;
  },
  clearCart: async (): Promise<ApiResponse<Cart>> => {
    const res = await api.delete('/cart');
    return res.data;
  },
};

export const orderApi = {
  checkout: async (request: {
    idempotencyKey: string;
    shippingAddress: string;
    items: Array<{ productId: string; productName: string; sku: string; unitPrice: number; quantity: number }>;
  }): Promise<ApiResponse<any>> => {
    const res = await api.post('/checkout', request);
    return res.data;
  },
  getOrders: async (): Promise<ApiResponse<Page<Order>>> => {
    const res = await api.get('/orders');
    return res.data;
  },
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getOrderTimeline: async (id: string): Promise<ApiResponse<OrderTimeline>> => {
    const res = await api.get(`/orders/${id}/timeline`);
    return res.data;
  },
  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<Page<NotificationItem>>> => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
};

export default api;
