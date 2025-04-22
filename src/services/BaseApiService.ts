import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, removeToken, clearTokens } from '../utils/tokenStorage';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

/**
 * Базовый класс для сервисов API
 */
export class BaseApiService {
  protected apiBase: string;
  protected mockBase: string;
  protected useMock: boolean;

  constructor(apiBase: string, mockBase: string = '', useMockByDefault: boolean = false) {
    this.apiBase = apiBase;
    this.mockBase = mockBase;
    this.useMock = useMockByDefault;
  }

  /**
   * Установить токен авторизации
   */
  public setAuthToken(token: string): void {
    // Implementation needed
  }

  /**
   * Очистить токен авторизации
   */
  public clearAuthToken(): void {
    // Implementation needed
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
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Проверяет, требуется ли использовать прокси для запроса
   */
  protected shouldUseProxy(url: string): boolean {
    // Implementation needed
    return false;
  }

  /**
   * Преобразует URL для проксирования
   */
  protected transformUrlForProxy(url: string): string {
    // Implementation needed
    return url;
  }

  /**
   * Set whether to use mock API
   */
  public setUseMock(useMock: boolean): void {
    this.useMock = useMock;
  }

  /**
   * Get current mock usage status
   */
  public getUseMock(): boolean {
    return this.useMock;
  }

  /**
   * Generic request method
   */
  protected async request<T>(
    method: string,
    url: string,
    options: {
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      responseType?: 'json' | 'blob' | 'text';
      useMock?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const useMock = options.useMock !== undefined ? options.useMock : this.useMock;
    const baseUrl = useMock ? this.mockBase : this.apiBase;
    const token = getToken();

    const config: AxiosRequestConfig = {
      method,
      url: `${baseUrl}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      data: options.data,
      params: options.params,
      responseType: options.responseType || 'json'
    };

    try {
      const response: AxiosResponse<T> = await axios(config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>
      };
    } catch (error: any) {
      if (!error.response) {
        // Connection error, try to use mock if not already
        if (!useMock && this.mockBase) {
          console.warn('API connection failed, falling back to mock data');
          return this.request<T>(method, url, { ...options, useMock: true });
        }
        throw new Error('Connection error');
      }

      // Handle unauthorized
      if (error.response.status === 401) {
        clearTokens();
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  protected async get<T>(
    url: string, 
    params?: Record<string, any>, 
    options: Omit<Parameters<typeof this.request>[2], 'params'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, { ...options, params });
  }

  /**
   * POST request
   */
  protected async post<T>(
    url: string, 
    data?: any, 
    options: Omit<Parameters<typeof this.request>[2], 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, { ...options, data });
  }

  /**
   * PUT request
   */
  protected async put<T>(
    url: string, 
    data?: any, 
    options: Omit<Parameters<typeof this.request>[2], 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, { ...options, data });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    url: string, 
    params?: Record<string, any>, 
    options: Omit<Parameters<typeof this.request>[2], 'params'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, { ...options, params });
  }

  /**
   * Загрузка файла на сервер
   */
  public async uploadFile<T = any>(endpoint: string, file: File, additionalData: Record<string, any> = {}): Promise<T> {
    // Implementation needed
    return Promise.resolve(null as T);
  }
} 