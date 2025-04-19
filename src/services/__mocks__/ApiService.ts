// Мок модуля ApiService
import { AxiosRequestConfig } from 'axios';
import { ApiError, ValidationError, AuthError } from '../../utils/errorHandler';

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
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
};

const responseErrorInterceptor = (error: any) => {
  // Обработка 401 - редирект на логин
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  
  // Преобразование ответов в специфичные ошибки
  if (error.response) {
    const { status } = error.response;
    const data = error.response.data;
    
    if (status === 400 && data?.errors) {
      const validationError = new ValidationError(
        data.message || 'Validation failed',
        data.errors
      );
      return Promise.reject(validationError);
    } else if (status === 401 || status === 403) {
      const authError = new AuthError(
        data?.message || 'Authentication failed'
      );
      return Promise.reject(authError);
    } else {
      const apiError = new ApiError(
        data?.message || 'API request failed',
        status,
        data
      );
      return Promise.reject(apiError);
    }
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
        return responseErrorInterceptor(error);
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
        return responseErrorInterceptor(error);
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
        return responseErrorInterceptor(error);
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
        return responseErrorInterceptor(error);
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