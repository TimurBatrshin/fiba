// Мок модуля ApiService
import { AxiosRequestConfig } from 'axios';
import { ApiError, ValidationError, AuthError } from '../../utils/errorHandler';
import { BASE_PATH } from '../../config/envConfig';
import { getStoredToken, removeStoredToken } from '../../utils/tokenStorage';

// Расширенный тип для request interceptor
interface RequestInterceptor {
  use: jest.Mock;
  successHandler?: (config: any) => any;
}

// Расширенный тип для response interceptor
interface ResponseInterceptor {
  use: jest.Mock;
  successHandler?: (response: any) => any;
  errorHandler?: (error: any) => any;
}

// Мокаем axios client с перехватчиками запросов
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    } as RequestInterceptor,
    response: {
      use: jest.fn()
    } as ResponseInterceptor
  }
};

// Обработчики интерцепторов
const requestInterceptor = (config: any) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
};

const responseInterceptor = (response: any) => {
  return response;
};

const errorInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    removeStoredToken();
  }
  return Promise.reject(error);
};

// Подключаем интерцепторы по умолчанию
mockApiClient.interceptors.request.use.mockImplementation((handler) => {
  return handler;
});

mockApiClient.interceptors.response.use.mockImplementation((successHandler, errorHandler) => {
  if (errorHandler) {
    // Сохраняем обработчик ошибок, чтобы его можно было вызвать в тестах
    (mockApiClient.interceptors.response as any).errorHandler = errorHandler;
  }
  return successHandler;
});

// Экспортируем ApiService с моками методов
export class ApiService {
  /**
   * GET запрос
   */
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await mockApiClient.get(url, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return errorInterceptor(error);
      }
      throw error;
    }
  }

  /**
   * POST запрос
   */
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await mockApiClient.post(url, data, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return errorInterceptor(error);
      }
      throw error;
    }
  }

  /**
   * PUT запрос
   */
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await mockApiClient.put(url, data, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return errorInterceptor(error);
      }
      throw error;
    }
  }

  /**
   * DELETE запрос
   */
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await mockApiClient.delete(url, config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return errorInterceptor(error);
      }
      throw error;
    }
  }

  /**
   * Возвращает понятное для пользователя сообщение об ошибке
   */
  static getErrorMessage(error: any): string {
    if (error instanceof ApiError || 
        error instanceof ValidationError || 
        error instanceof AuthError) {
      return error.message;
    }
    return error?.message || 'Произошла неизвестная ошибка.';
  }

  /**
   * Возвращает ошибки валидации для полей формы
   */
  static getValidationErrors(error: any): { [key: string]: any } {
    if (!error) return {};
    
    if (error instanceof ValidationError) {
      return error.errors;
    }
    
    if (error.errors) {
      return error.errors;
    }
    
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    
    return {};
  }
}

export default ApiService; 