import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, APP_SETTINGS } from '../config/envConfig';
import logger from '../utils/logger';
import ErrorHandler, { ApiError, ValidationError, AuthError } from '../utils/errorHandler';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem(APP_SETTINGS.tokenStorageKey);
    
    // If not found in primary location, try the legacy 'token' key
    if (!token) {
      token = localStorage.getItem('token');
      
      // If found in legacy location, sync it to the preferred location
      if (token) {
        localStorage.setItem(APP_SETTINGS.tokenStorageKey, token);
        logger.info('Token found in legacy storage and synced to preferred location');
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request error interceptor', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear tokens from both storage locations
      localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Log errors
    logger.error('API Error', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Transform error to custom error type
    if (error.response) {
      const { status } = error.response;
      const data = error.response.data as any;
      
      if (status === 400 && data?.errors) {
        return Promise.reject(new ValidationError(
          data.message || 'Validation failed',
          data.errors
        ));
      } else if (status === 401 || status === 403) {
        return Promise.reject(new AuthError(
          data?.message || 'Authentication failed'
        ));
      } else {
        return Promise.reject(new ApiError(
          data?.message || 'API request failed',
          status,
          data
        ));
      }
    }
    
    return Promise.reject(error);
  }
);

export class ApiService {
  // GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // POST request
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // PUT request
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Error handler
  private static handleError(error: any): void {
    // Add application-specific error handling logic
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          logger.warn('Bad Request', { data: error.data });
          break;
        case 403:
          logger.warn('Forbidden Access', { data: error.data });
          break;
        case 404:
          logger.warn('Resource Not Found');
          break;
        case 500:
          logger.error('Server Error', { data: error.data });
          break;
      }
    } else if (error instanceof ValidationError) {
      logger.warn('Validation Error', { errors: error.errors });
    } else if (error instanceof AuthError) {
      logger.warn('Auth Error', { message: error.message });
    }
    // Other types of errors are already logged in the interceptor
  }
  
  /**
   * Returns a user-friendly error message
   */
  static getErrorMessage(error: any): string {
    return ErrorHandler.getUserFriendlyMessage(error);
  }
  
  /**
   * Returns validation errors for form fields
   */
  static getValidationErrors(error: any): { [key: string]: string } {
    return ErrorHandler.getValidationErrors(error);
  }
}

export default ApiService; 