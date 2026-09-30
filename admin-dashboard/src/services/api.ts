import axios from 'axios';
import type { ApiResponse, User, Product, InventoryItem, Order, OrderTimeline, Page } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ accessToken: string; user: User }>> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};

export const inventoryApi = {
  getAll: async (): Promise<ApiResponse<InventoryItem[]>> => {
    const res = await api.get('/inventory');
    return res.data;
  },
  getByProductId: async (productId: string): Promise<ApiResponse<InventoryItem>> => {
    const res = await api.get(`/inventory/${productId}`);
    return res.data;
  },
  adjustStock: async (productId: string, delta: number): Promise<ApiResponse<InventoryItem>> => {
    const res = await api.put(`/inventory/${productId}/adjust`, { delta });
    return res.data;
  },
};

export const orderApi = {
  getAllOrders: async (params?: { page?: number; size?: number }): Promise<ApiResponse<Page<Order>>> => {
    const res = await api.get('/orders/all', { params });
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
  updateOrderStatus: async (
    id: string,
    update: { status: string; trackingNumber?: string; carrier?: string; notes?: string }
  ): Promise<ApiResponse<Order>> => {
    const res = await api.put(`/orders/${id}/status`, update);
    return res.data;
  },
  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};

export const catalogApi = {
  getProducts: async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<Page<Product>>> => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getCategories: async (): Promise<ApiResponse<any[]>> => {
    const res = await api.get('/categories');
    return res.data;
  },
};

export default api;
