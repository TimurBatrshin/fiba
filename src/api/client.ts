import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { APP_SETTINGS } from '../config/envConfig';

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

// Создаем базовый экземпляр axios
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Перехватчик запросов для добавления токена авторизации
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(APP_SETTINGS.tokenStorageKey);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Перехватчик ответов для обработки ошибок
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Проверка на ошибку авторизации
      if (error.response?.status === 401) {
        // Очистка токена и перенаправление на страницу входа
        localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
        window.location.href = '/login';
      }

      // Преобразование ошибки в удобный формат
      const apiError: ApiError = {
        message: error.message || 'Неизвестная ошибка',
        status: error.response?.status,
        data: error.response?.data
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Создаем API-клиент с базовым URL из конфигурации
export const apiClient = createApiClient(APP_SETTINGS.apiBaseUrl || '');

// Обертки для HTTP-методов
export const api = {
  // GET запрос
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST запрос
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT запрос
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE запрос
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH запрос
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 