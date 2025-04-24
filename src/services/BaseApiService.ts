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
  private axiosInstance: AxiosInstance;
  
  // Перечень публичных эндпоинтов, для которых не требуется авторизация
  private publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/tournaments/public',
    '/tournaments/list',
    '/tournaments/upcoming',
    '/tournaments/recent',
    '/tournaments/search',
    '/tournaments',
    '/tournaments/locations',
    '/tournaments/',
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
    });
    
    // Setup request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Логируем URL запроса
        console.log(`BaseApiService: Making request to ${config.url}`);
        
        // Добавляем токен авторизации, если он есть
        const token = localStorage.getItem(APP_SETTINGS.tokenStorageKey) || localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
      console.log(`BaseApiService: URL ${url} определен как публичный эндпоинт`);
    }
    
    return isInPublicList || isTournamentDetails;
  }

  /**
   * Установить токен авторизации
   */
  public setAuthToken(token: string): void {
    localStorage.setItem(APP_SETTINGS.tokenStorageKey, token);
  }

  /**
   * Очистить токен авторизации
   */
  public clearAuthToken(): void {
    clearTokens();
  }

  /**
   * Создать заголовки для запросов
   */
  protected createHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    const token = getToken();
    if (token) {
      console.log('[BaseApiService] Adding Authorization header with token');
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      console.warn('[BaseApiService] No token available for Authorization header');
    }

    return headers;
  }

  /**
   * Проверяет, требуется ли использовать прокси для запроса
   */
  protected shouldUseProxy(url: string): boolean {
    // Не используем прокси
    return false;
  }

  /**
   * Преобразует URL для проксирования
   */
  protected transformUrlForProxy(url: string): string {
    // Если включен режим прокси, возвращаем только путь без домена
    if (this.shouldUseProxy(url)) {
      // Извлекаем часть URL после /api/
      const apiIndex = url.indexOf('/api/');
      if (apiIndex !== -1) {
        const transformedUrl = url.substring(apiIndex + 4); // +4 чтобы пропустить /api/
        return transformedUrl;
      }
    }
    return url;
  }

  /**
   * Generic request method
   */
  protected async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance(config);
    } catch (error) {
      console.error('BaseApiService: Request error:', error);
      throw error;
    }
  }

  /**
   * GET method
   */
  protected async get<T>(url: string, options: any = {}): Promise<AxiosResponse<T>> {
    // Check if options contains a params property
    if (options && options.params) {
      // Request config is properly structured with top-level params
      return this.request<T>({
        method: 'get',
        url,
        params: options.params,
      });
    } else {
      // Treat the entire options as params (for backward compatibility)
      return this.request<T>({
        method: 'get',
        url,
        params: options,
      });
    }
  }

  /**
   * POST method
   */
  protected async post<T>(url: string, data = {}): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'post',
      url,
      data,
    });
  }

  /**
   * PUT method
   */
  protected async put<T>(url: string, data = {}): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'put',
      url,
      data,
    });
  }

  /**
   * DELETE method
   */
  protected async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: 'delete',
      url,
    });
  }

  /**
   * Загрузка файла на сервер
   */
  public async uploadFile<T = any>(endpoint: string, file: File): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('photo', file, file.name); // Явно указываем имя файла
  
      const response = await fetch(API_CONFIG.baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}` // Если требуется авторизация
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BaseApiService] Error uploading file to ${endpoint}:`, errorText);
        throw new Error(`Request failed with status code ${response.status}: ${errorText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error(`[BaseApiService] Error uploading file to ${endpoint}:`, error);
      throw error;
    }
  }
} 