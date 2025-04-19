import { ErrorHandler } from '../utils/errorHandler';
import { API_CONFIG } from '../config/api';

/**
 * Сервис для работы с API
 */
export class ApiService {
  private static token: string | null = null;
  private static baseUrl: string = API_CONFIG?.baseUrl || '';

  /**
   * Установить токен авторизации
   */
  public static setAuthToken(token: string): void {
    ApiService.token = token;
  }

  /**
   * Очистить токен авторизации
   */
  public static clearAuthToken(): void {
    ApiService.token = null;
  }

  /**
   * Создать заголовки для запросов
   */
  private static createHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    if (ApiService.token) {
      headers.append('Authorization', `Bearer ${ApiService.token}`);
    }

    return headers;
  }

  /**
   * Выполнить запрос к API
   */
  private static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: ApiService.createHeaders(),
    });

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
  public static async get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${ApiService.baseUrl}${endpoint}`);
    
    // Добавляем параметры запроса
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    return ApiService.request<T>(url.toString(), {
      method: 'GET',
    });
  }

  /**
   * Выполнить POST-запрос
   */
  public static async post<T = any>(endpoint: string, data: any = {}, options: Record<string, any> = {}): Promise<T> {
    const url = `${ApiService.baseUrl}${endpoint}`;
    
    return ApiService.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * Выполнить PUT-запрос
   */
  public static async put<T = any>(endpoint: string, data: any = {}): Promise<T> {
    const url = `${ApiService.baseUrl}${endpoint}`;
    
    return ApiService.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Выполнить DELETE-запрос
   */
  public static async delete<T = any>(endpoint: string): Promise<T> {
    const url = `${ApiService.baseUrl}${endpoint}`;
    
    return ApiService.request<T>(url, {
      method: 'DELETE',
    });
  }
} 