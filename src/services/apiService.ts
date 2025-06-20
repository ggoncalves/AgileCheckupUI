import axios, { AxiosRequestConfig } from 'axios';

// Base URL for the API - use the proxy path configured in next.config.ts
const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include tenantId in all requests
apiClient.interceptors.request.use((config) => {
  // Get tenantId from localStorage (this is updated by TenantContext)
  const tenantId = localStorage.getItem('tenantId');

  // If tenantId exists and the request has params, add tenantId to params
  if (tenantId) {
    // Ensure params object exists
    config.params = config.params || {};

    // Add tenantId to params if not already present
    if (!config.params.tenantId) {
      config.params.tenantId = tenantId;
    }
  }

  return config;
});

// API service with common methods
const apiService = {
  // Get all companies (no tenantId needed for this request)
  getCompanies: async () => {
    try {
      const response = await apiClient.get('/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Generic GET request with tenantId automatically included
  get: async <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic POST request with tenantId automatically included in query params
  post: async <T = unknown>(endpoint: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic PUT request
  put: async <T = unknown>(endpoint: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error updating at ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic DELETE request
  delete: async <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`Error deleting at ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiService;