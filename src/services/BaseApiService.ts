import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { getToken, removeToken, clearTokens } from '../utils/tokenStorage';
import { APP_SETTINGS, BASE_PATH } from '../config/envConfig';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

/**
 * Базовый класс для сервисов API
 */
export class BaseApiService {
  private baseUrl: string;
  protected axiosInstance: AxiosInstance;
  
  // Перечень публичных эндпоинтов, для которых не требуется авторизация
  private publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/tournaments/public',
    '/tournaments/list',
    '/tournaments/upcoming',
    '/tournaments/recent',
    '/tournaments/search',
    '/tournaments/locations',
    '/tournaments/status/UPCOMING',
    '/tournaments/status/ONGOING',
    '/tournaments/status/COMPLETED',
    '/tournaments/status/',
    '/players/top',
    '/users/top'
  ];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      // Отключаем автоматическое кодирование URL
      paramsSerializer: {
        encode: (param: string) => param,
        serialize: (params: Record<string, any>) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, value);
          });
          return searchParams.toString();
        }
      }
    });
    
    // Setup request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Логируем URL запроса
        console.log(`BaseApiService: Making request to ${config.url}`);
        
        // Добавляем токен авторизации, если он есть
        const tokenFromMain = localStorage.getItem(APP_SETTINGS.tokenStorageKey);
        const tokenFromLegacy = localStorage.getItem('token');
        console.log('BaseApiService: Tokens in storage:', {
          mainToken: tokenFromMain ? 'present' : 'missing',
          legacyToken: tokenFromLegacy ? 'present' : 'missing'
        });
        
        const token = tokenFromMain || tokenFromLegacy;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('BaseApiService: Added Authorization header:', config.headers.Authorization);
        } else {
          console.log('BaseApiService: No token available for request');
        }
        return config;
      },
      (error) => {
        console.error('BaseApiService: Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Setup response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Логируем успешный ответ
        console.log(`BaseApiService: Successful response from ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        // Проверяем, является ли URL запроса публичным эндпоинтом
        const requestUrl = error.config?.url || '';
        const isPublicEndpoint = this.isPublicEndpoint(requestUrl);
        
        // Логируем ошибку
        console.error(`BaseApiService: Error response (${error.response?.status}) from ${requestUrl}`, error);
        
        // 401 error handling
        if (error.response && error.response.status === 401) {
          // Если это публичный эндпоинт, просто возвращаем ошибку без очистки токена
          if (isPublicEndpoint) {
            console.log(`BaseApiService: Ignoring 401 error for public endpoint: ${requestUrl}`);
            return Promise.reject(error);
          }
          
          // Для других эндпоинтов очищаем токен и перенаправляем на страницу входа
          console.log(`BaseApiService: Received 401, clearing auth token and redirecting`);
          
          // Очищаем токен
          this.clearAuthToken();
          
          // Редирект на страницу входа, если мы не на странице входа или регистрации
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            console.log('BaseApiService: Redirecting to login page');
            window.location.href = `${BASE_PATH}#/login`;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * HTTP GET request
   */
  protected async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * HTTP POST request
   */
  protected async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {};
    
    // If data is URLSearchParams, set the correct Content-Type
    if (data instanceof URLSearchParams) {
      config.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }
    
    const response = await this.axiosInstance.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * HTTP PUT request
   */
  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * HTTP DELETE request
   */
  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * Sets the authentication token in the axios instance
   */
  protected setAuthToken(token: string): void {
    if (this.axiosInstance.defaults.headers.common) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      this.axiosInstance.defaults.headers.common = {
        'Authorization': `Bearer ${token}`
      };
    }
  }

  /**
   * Clears the authentication token from both axios instance and storage
   */
  protected clearAuthToken(): void {
    // Clear from axios instance
    if (this.axiosInstance.defaults.headers.common) {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
    // Clear from storage
    removeToken();
  }
  
  /**
   * Проверяет, является ли URL публичным эндпоинтом
   */
  private isPublicEndpoint(url: string): boolean {
    // Убедимся, что URL существует и является строкой
    if (!url || typeof url !== 'string') return false;
    
    // Базовая проверка на наличие URL в списке публичных эндпоинтов
    const isInPublicList = this.publicEndpoints.some(endpoint => {
      // Проверяем точное совпадение начала пути с эндпоинтом
      return url.includes(endpoint);
    });
    
    // Дополнительная проверка для URL с ID турниров (например, /tournaments/123)
    const isTournamentDetails = /\/tournaments\/\d+$/.test(url) || /\/tournaments\/\d+\//.test(url);
    
    // Логируем для отладки
    if (isInPublicList || isTournamentDetails) {
      console.log(`BaseApiService: ${url} is a public endpoint`);
    }
    
    return isInPublicList || isTournamentDetails;
  }
}