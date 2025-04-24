import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { APP_SETTINGS, BASE_PATH } from '../config/envConfig';

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
    },
    // Добавляем правильную обработку параметров запроса
    paramsSerializer: {
      encode: (param: string) => encodeURIComponent(param),
      serialize: (params) => {
        // Преобразуем объект параметров в строку запроса
        return Object.entries(params)
          .map(([key, value]) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
          })
          .join('&');
      }
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
    (response) => response.data, // Возвращаем только данные ответа
    (error: any) => {
      // Отдельная обработка ошибок CORS
      if (typeof error.message === 'string' && error.message.includes('Network Error') || !error.response) {
        console.error('Возможная ошибка CORS или сетевая ошибка:', error.message);
        return Promise.reject({
          message: 'Проблема с сетевым соединением. Пожалуйста, проверьте ваше подключение или обратитесь к администратору.',
          status: 0,
          data: { originalError: error.message }
        });
      }

      // Проверка на ошибку авторизации
      if (error.response?.status === 401) {
        // Очищаем токены
        localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
        localStorage.removeItem('token');

        // Редирект на логин, если пользователь не на странице логина
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = `${BASE_PATH}#/login`;
        }
      }

      // Преобразование ошибки в удобный формат
      const apiError: ApiError = {
        message: error.response?.data?.message || (typeof error.message === 'string' ? error.message : 'Неизвестная ошибка'),
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
      console.log(`API GET: ${url}`, config);
      return await apiClient.get(url, config) as T;
    } catch (error: any) {
      console.error(`API GET error for ${url}:`, error);
      
      // Для методов, которые должны возвращать массивы, возвращаем пустой массив при ошибке
      if (url.includes('/tournaments') && !url.includes('/tournaments/')) {
        return ([] as unknown) as T;
      }
      
      throw error;
    }
  },

  // POST запрос
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`API POST: ${url}`, { data });
      return await apiClient.post(url, data, config) as T;
    } catch (error: any) {
      console.error(`API POST error for ${url}:`, error);
      throw error;
    }
  },

  // PUT запрос
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`API PUT: ${url}`, { data });
      return await apiClient.put(url, data, config) as T;
    } catch (error: any) {
      console.error(`API PUT error for ${url}:`, error);
      throw error;
    }
  },

  // DELETE запрос
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`API DELETE: ${url}`, config);
      return await apiClient.delete(url, config) as T;
    } catch (error: any) {
      console.error(`API DELETE error for ${url}:`, error);
      throw error;
    }
  },

  // PATCH запрос
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      console.log(`API PATCH: ${url}`, { data });
      return await apiClient.patch(url, data, config) as T;
    } catch (error: any) {
      console.error(`API PATCH error for ${url}:`, error);
      throw error;
    }
  }
};

export default api; 