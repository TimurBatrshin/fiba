import { ErrorHandler } from '../utils/errorHandler';
import { API_CONFIG } from '../config/api';

// Declare the global type for window.authService
declare global {
  interface Window {
    authService?: {
      refreshToken: () => Promise<void>;
    };
  }
}

/**
 * Базовый класс для сервисов API
 */
export abstract class BaseApiService {
  protected baseUrl: string;
  protected token: string | null = null;

  constructor(baseUrl: string = API_CONFIG.baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Установить токен авторизации
   */
  public setAuthToken(token: string): void {
    this.token = token;
  }

  /**
   * Очистить токен авторизации
   */
  public clearAuthToken(): void {
    this.token = null;
  }

  /**
   * Создать заголовки для запросов
   */
  protected createHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }

    return headers;
  }

  /**
   * Проверяет, требуется ли использовать прокси для запроса
   */
  protected shouldUseProxy(url: string): boolean {
    // Проверяем, относится ли URL к статическим ресурсам bro-js
    return url.includes('static.bro-js.ru') || url.includes('dev.bro-js.ru');
  }

  /**
   * Преобразует URL для проксирования
   */
  protected transformUrlForProxy(url: string): string {
    try {
      const urlObj = new URL(url);
      
      if (this.shouldUseProxy(url)) {
        // Извлекаем путь после домена
        const path = urlObj.pathname;
        
        // Используем полный URL с нашим доменом API для прокси
        const baseProxyUrl = 'https://timurbatrshin-fiba-backend-1aa7.twc1.net/api/proxy/static-bro-js';
        
        // Если это JS файл, добавляем метку времени для предотвращения кэширования
        if (path.endsWith('.js')) {
          return `${baseProxyUrl}${path}?t=${Date.now()}`;
        }
        
        // Другие статические ресурсы
        return `${baseProxyUrl}${path}`;
      }
      
      return url;
    } catch (e) {
      // Если не можем разобрать URL, оставляем как есть
      return url;
    }
  }

  /**
   * Выполнить запрос к API
   */
  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Проверяем, нужно ли использовать прокси
    const requestUrl = this.transformUrlForProxy(url);
    
    const response = await fetch(requestUrl, {
      ...options,
      credentials: 'include', // Always include credentials for CORS
      headers: this.createHeaders(),
    });

    // Handle 401 Unauthorized - potentially token expired
    if (response.status === 401) {
      // Try to refresh token or redirect to login
      if (window.authService) {
        try {
          await window.authService.refreshToken();
          // Retry the request with new token
          return this.request<T>(url, options);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Continue with error handling below
        }
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      
      // Используем ErrorHandler для генерации нужного типа ошибки
      ErrorHandler.throwFromResponse({
        status: response.status,
        data: data,
      });
    }

    return response.json() as Promise<T>;
  }

  /**
   * Выполнить GET-запрос
   */
  public async get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Добавляем параметры запроса
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return this.request<T>(url.toString(), {
      method: 'GET',
    });
  }

  /**
   * Выполнить POST-запрос
   */
  public async post<T = any>(endpoint: string, data: any = {}, options: RequestInit & Record<string, any> = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    };

    // If headers are provided in options, merge them with defaults
    if (options.headers) {
      const headers = new Headers(this.createHeaders());
      
      // Add the custom headers
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      } else if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, String(value));
        });
      }
      
      // Override the headers in request options
      requestOptions.headers = headers;
    }
    
    return this.request<T>(url, requestOptions);
  }

  /**
   * Выполнить PUT-запрос
   */
  public async put<T = any>(endpoint: string, data: any = {}, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * Выполнить DELETE-запрос
   */
  public async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.request<T>(url, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Загрузка файла на сервер
   */
  public async uploadFile<T = any>(endpoint: string, file: File, additionalData: Record<string, any> = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data to form if needed
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // Use different headers for file upload (no Content-Type)
    const headers = new Headers();
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }
    
    return this.request<T>(url, {
      method: 'POST',
      body: formData,
      headers,
    });
  }
} 