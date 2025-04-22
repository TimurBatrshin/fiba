import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';
import { ErrorHandler, ApiError, ValidationError, AuthError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { User, UserUpdateInput } from './UserService';

/**
 * Сервис для работы с API
 */
class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Setup interceptors
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add CORS settings to all requests
        config.withCredentials = true;
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          // Handle unauthorized access
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Получить экземпляр сервиса (Singleton)
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  /**
   * Обработчик ошибок
   */
  protected handleError(error: any): void {
    // Добавляем специфичную для приложения логику обработки ошибок
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
  }
  
  /**
   * Возвращает понятное пользователю сообщение об ошибке
   */
  public getErrorMessage(error: any): string {
    return ErrorHandler.getUserFriendlyMessage(error);
  }
  
  /**
   * Возвращает ошибки валидации для полей формы
   */
  public getValidationErrors(error: any): { [key: string]: string } {
    return ErrorHandler.getValidationErrors(error);
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url, {
        ...config,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, {
        ...config,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, {
        ...config,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, {
        ...config,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  // Tournament specific methods
  async getAllTournaments() {
    return this.get<any[]>('/tournaments');
  }
  
  async getTournamentById(id: string) {
    return this.get<any>(`/tournaments/${id}`);
  }
  
  async getUpcomingTournaments() {
    return this.get('/tournaments/upcoming');
  }
  
  async getCompletedTournaments() {
    return this.get('/tournaments/completed');
  }
  
  async searchTournamentsByLocation(location: string) {
    return this.get('/tournaments/search', { params: { location } });
  }
  
  async getBusinessTournaments() {
    return this.get('/tournaments/business');
  }
  
  // Admin methods for tournament management
  async createTournament(tournamentData: any) {
    return this.post<any>('/admin/tournaments', tournamentData);
  }
  
  async updateTournament(id: string, tournamentData: any) {
    return this.put<any>(`/admin/tournaments/${id}`, tournamentData);
  }
  
  async deleteTournament(id: string) {
    return this.delete<void>(`/admin/tournaments/${id}`);
  }
  
  async updateTeamStatus(tournamentId: string, teamId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'COMPLETED') {
    return this.put<any>(`/admin/tournaments/${tournamentId}/teams/${teamId}`, { status });
  }
  
  // Team methods
  async getAllTeams() {
    return this.get<any[]>('/teams');
  }
  
  async getTeamById(id: string) {
    return this.get<any>(`/teams/${id}`);
  }
  
  async searchTeamsByName(name: string) {
    return this.get('/teams/search', { params: { name } });
  }
  
  async getTopTeams(limit: number = 10) {
    return this.get('/teams/top', { params: { limit } });
  }
  
  async getTournamentTeams(tournamentId: string, status?: string) {
    const params = status ? { status } : undefined;
    return this.get(`/tournaments/${tournamentId}/teams`, status ? { params } : undefined);
  }
  
  // User-related methods
  async getCurrentUser(): Promise<any> {
    return this.get('/users/me');
  }

  async getUserById(userId: string): Promise<any> {
    return this.get(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.put(`/users/${userId}`, userData);
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await this.post<{token: string}>('/auth/login', credentials);
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }

  async register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string 
  }): Promise<any> {
    const response = await this.post<{token: string}>('/auth/register', userData);
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }

  async logout(): Promise<any> {
    localStorage.removeItem('token');
    return this.post('/auth/logout', {});
  }
  
  clearAuthToken() {
    // Method to clear auth token
  }
}

// Экспортируем экземпляр для упрощения импорта
export default ApiService.getInstance(); 