// src/lib/api/client.ts
// Axios client configuration with interceptors

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Token management
const TOKEN_KEY = 'thapargo_auth_token';
const TEMP_TOKEN_KEY = 'thapargo_temp_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getTempToken = (): string | null => {
  return localStorage.getItem(TEMP_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TEMP_TOKEN_KEY);
};

export const setTempToken = (token: string): void => {
  localStorage.setItem(TEMP_TOKEN_KEY, token);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TEMP_TOKEN_KEY);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken() || getTempToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        clearTokens();
        window.location.href = '/auth';
      }
      
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        });
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
