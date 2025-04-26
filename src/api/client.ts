import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { APP_SETTINGS } from '../config/envConfig';
import { getStoredToken, removeStoredToken } from '../utils/tokenStorage';

// Типы для API-запросов
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  data?: any;
}

// Создание экземпляра axios с базовой конфигурацией
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Перехватчик запросов
  client.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      const method = config.method?.toUpperCase() || 'GET';
      const url = config.url || '';
      
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log(`[API Client] Adding auth token to ${method} request to ${url}`);
      } else {
        console.log(`[API Client] No auth token available for ${method} request to ${url}`);
      }

      // Log request details
      console.log('[API Client] Request:', {
        method,
        url,
        headers: config.headers,
        data: config.data
      });
      
      return config;
    },
    (error) => {
      console.error('[API Client] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  client.interceptors.response.use(
    (response) => {
      console.log(`[API Client] Response received:`, {
        status: response.status,
        url: response.config.url,
        method: response.config.method,
        data: response.data
      });
      return response;
    },
    async (error: AxiosError) => {
      console.error('[API Client] Request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        error: error.response?.data,
        message: error.message
      });

      // Если получаем 401, значит токен истек или недействителен
      if (error.response?.status === 401) {
        console.log('[API Client] Unauthorized request, removing token');
        // Удаляем невалидный токен
        removeStoredToken();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create and export the API client instance
const api = createApiClient(APP_SETTINGS.apiBaseUrl);
export default api; 