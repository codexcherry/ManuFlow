import axios from 'axios';
import {
  User,
  Product,
  WorkCenter,
  BOM,
  ManufacturingOrder,
  WorkOrder,
  StockMovement,
  DashboardStats,
  ProductionReport,
  CreateProductData,
  CreateWorkCenterData,
  CreateBOMData,
  CreateManufacturingOrderData,
  CreateStockMovementData,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access but prevent redirect loops
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, role: string = 'operator') => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  create: async (data: CreateProductData): Promise<{ message: string; id: number }> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProductData>): Promise<{ message: string }> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Work Centers API
export const workCentersAPI = {
  getAll: async (): Promise<WorkCenter[]> => {
    const response = await api.get('/work-centers');
    return response.data;
  },

  create: async (data: CreateWorkCenterData): Promise<{ message: string; id: number }> => {
    const response = await api.post('/work-centers', data);
    return response.data;
  },
};

// BOM API
export const bomAPI = {
  getAll: async (): Promise<BOM[]> => {
    const response = await api.get('/boms');
    return response.data;
  },

  create: async (data: CreateBOMData): Promise<{ message: string; id: number }> => {
    const response = await api.post('/boms', data);
    return response.data;
  },
};

// Manufacturing Orders API
export const manufacturingOrdersAPI = {
  getAll: async (state?: string): Promise<ManufacturingOrder[]> => {
    const response = await api.get('/manufacturing-orders', {
      params: state ? { state } : {},
    });
    return response.data;
  },

  create: async (data: CreateManufacturingOrderData): Promise<{ message: string; id: number; reference: string }> => {
    const response = await api.post('/manufacturing-orders', data);
    return response.data;
  },

  confirm: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/manufacturing-orders/${id}/confirm`);
    return response.data;
  },

  complete: async (id: number, quantityProduced: number): Promise<{ message: string }> => {
    const response = await api.post(`/manufacturing-orders/${id}/complete`, {
      quantity_produced: quantityProduced,
    });
    return response.data;
  },
};

// Work Orders API
export const workOrdersAPI = {
  getAll: async (manufacturingOrderId?: number): Promise<WorkOrder[]> => {
    const response = await api.get('/work-orders', {
      params: manufacturingOrderId ? { manufacturing_order_id: manufacturingOrderId } : {},
    });
    return response.data;
  },

  start: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/work-orders/${id}/start`);
    return response.data;
  },

  complete: async (id: number, actualTime?: number, notes?: string): Promise<{ message: string }> => {
    const response = await api.post(`/work-orders/${id}/complete`, {
      actual_time: actualTime,
      notes,
    });
    return response.data;
  },
};

// Stock Movements API
export const stockMovementsAPI = {
  getAll: async (productId?: number): Promise<StockMovement[]> => {
    const response = await api.get('/stock-movements', {
      params: productId ? { product_id: productId } : {},
    });
    return response.data;
  },

  create: async (data: CreateStockMovementData): Promise<{ message: string; id: number }> => {
    const response = await api.post('/stock-movements', data);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getProductionReport: async (startDate?: string, endDate?: string): Promise<ProductionReport[]> => {
    const response = await api.get('/reports/production', {
      params: {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      },
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default api;
