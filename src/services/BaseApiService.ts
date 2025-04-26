import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { API_BASE_URL, BASE_PATH } from '../config/envConfig';
import { getStoredToken, removeStoredToken, setStoredToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

/**
 * Базовый класс для сервисов API
 */
export class BaseApiService {
  protected axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshAttempts = 0;
  private maxRefreshAttempts = 3;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Initialize with token if exists
    const token = getStoredToken();
    if (token) {
      this.setAuthToken(token);
    }
    
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Get fresh token for each request
        const currentToken = getStoredToken();
        if (currentToken) {
          try {
            // Check token expiration
            const decoded = jwtDecode(currentToken);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp && decoded.exp <= currentTime) {
              console.log('Token has expired, attempting to refresh');
              try {
                // Try to refresh the token
                const response = await this.axiosInstance.post('/auth/refresh-token');
                const newToken = response.data.token;
                
                if (newToken) {
                  setStoredToken(newToken);
                  config.headers['Authorization'] = `Bearer ${newToken}`;
                }
              } catch (refreshError) {
                console.log('Token refresh failed during request');
                removeStoredToken();
                if (typeof window !== 'undefined') {
                  window.location.href = `${BASE_PATH}#/login`;
                }
                return Promise.reject(refreshError);
              }
            } else if (config.headers) {
              config.headers['Authorization'] = `Bearer ${currentToken}`;
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            removeStoredToken();
          }
        }

        console.log('Making request:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          fullUrl: `${config.baseURL}${config.url}`,
          data: config.data,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Reset refresh attempts on successful response
        this.refreshAttempts = 0;
        console.log('Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });
        return response;
      },
      async (error: AxiosError) => {
        console.log('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config
        });

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !this.isRefreshing) {
          // Check if we've exceeded max refresh attempts
          if (this.refreshAttempts >= this.maxRefreshAttempts) {
            console.log('Max refresh attempts exceeded, logging out');
            removeStoredToken();
            this.clearAuthToken();
            if (typeof window !== 'undefined') {
              window.location.href = `${BASE_PATH}#/login`;
            }
            return Promise.reject(new Error('Session expired. Please login again.'));
          }

          console.log('Unauthorized request detected, attempting to refresh token');
          
          try {
            this.isRefreshing = true;
            this.refreshAttempts++;
            console.log('Setting isRefreshing flag to true');
            
            // Try to refresh the token
            const response = await this.axiosInstance.post('/auth/refresh-token');
            const newToken = response.data.token;
            
            if (newToken) {
              console.log('New token received, length:', newToken.length);
              // Save the new token
              setStoredToken(newToken);
              this.setAuthToken(newToken);
              
              // Retry the original request with the new token
              if (error.config) {
                const newConfig = { ...error.config };
                newConfig.headers['Authorization'] = `Bearer ${newToken}`;
                console.log('Retrying original request with new token');
                return this.axiosInstance.request(newConfig);
              }
            } else {
              console.error('Received empty token from refresh endpoint');
              throw new Error('Empty refresh token response');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            if (this.refreshAttempts >= this.maxRefreshAttempts) {
              removeStoredToken();
              this.clearAuthToken();
              if (typeof window !== 'undefined') {
                window.location.href = `${BASE_PATH}#/login`;
              }
            }
            throw new Error('Session expired. Please login again.');
          } finally {
            console.log('Setting isRefreshing flag to false');
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  protected async request<T>(
    method: string,
    url: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<AxiosResponse<T>> {
    const token = getStoredToken();
    const config = {
      method,
      url,
      headers: {
        ...headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      data
    };
    return this.axiosInstance.request<T>(config);
  }

  protected async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const token = getStoredToken();
    const config = { 
      params,
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    };
    const response = await this.axiosInstance.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  protected async post<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    const token = getStoredToken();
    const finalConfig = {
      ...config,
      headers: {
        ...config.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    
    if (data instanceof URLSearchParams) {
      finalConfig.headers = {
        ...finalConfig.headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }
    
    const response = await this.axiosInstance.post<T>(url, data, finalConfig);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  protected async put<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> {
    const token = getStoredToken();
    const finalConfig = {
      ...config,
      headers: {
        ...config.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const response = await this.axiosInstance.put<T>(url, data, finalConfig);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    const token = getStoredToken();
    const config = {
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    };
    const response = await this.axiosInstance.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>
    };
  }

  protected setAuthToken(token: string): void {
    if (this.axiosInstance.defaults.headers.common) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      this.axiosInstance.defaults.headers.common = {
        'Authorization': `Bearer ${token}`
      };
    }
  }

  protected clearAuthToken(): void {
    if (this.axiosInstance.defaults.headers.common) {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }
}