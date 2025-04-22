import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';
import { ErrorHandler, ApiError, ValidationError, AuthError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { User } from '../interfaces/Auth';
import { 
  Tournament, 
  TournamentStatus, 
  TournamentTeam, 
  Registration, 
  RegistrationStatus 
} from '../interfaces/Tournament';
import { Team, Player } from '../interfaces/Team';

// Adding fallbackUrl to the API_CONFIG if it doesn't exist
if (!('fallbackUrl' in API_CONFIG)) {
  (API_CONFIG as any).fallbackUrl = API_CONFIG.mockUrl; // Use mockUrl as fallback
}

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
      withCredentials: true, // Always include credentials for CORS
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
        
        // Always ensure credentials are included for CORS
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
          // Try to refresh token if available
          const authService = require('./AuthService').AuthService.getInstance();
          if (authService) {
            authService.refreshToken().catch(() => {
              // If refresh fails, logout
              authService.logout();
            });
          }
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
    } catch (error: any) {
      // Проверяем, связана ли ошибка с таймаутом
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.warn(`Таймаут запроса к ${url}. Пробуем использовать резервный URL...`);
        try {
          // Создаем новый экземпляр axios с резервным URL
          const fallbackApi = axios.create({
            baseURL: API_CONFIG.fallbackUrl,
            timeout: API_CONFIG.timeout,
            withCredentials: API_CONFIG.withCredentials,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Пробуем выполнить запрос с резервным URL
          const fallbackResponse: AxiosResponse<T> = await fallbackApi.get(url, {
            ...config,
            withCredentials: true
          });
          
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Ошибка при использовании резервного URL:', fallbackError);
          this.handleError(fallbackError);
          throw fallbackError;
        }
      }
      
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
    } catch (error: any) {
      // Проверяем, связана ли ошибка с таймаутом
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.warn(`Таймаут запроса к ${url}. Пробуем использовать резервный URL...`);
        try {
          // Создаем новый экземпляр axios с резервным URL
          const fallbackApi = axios.create({
            baseURL: API_CONFIG.fallbackUrl,
            timeout: API_CONFIG.timeout,
            withCredentials: API_CONFIG.withCredentials,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Пробуем выполнить запрос с резервным URL
          const fallbackResponse: AxiosResponse<T> = await fallbackApi.post(url, data, {
            ...config,
            withCredentials: true
          });
          
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Ошибка при использовании резервного URL:', fallbackError);
          this.handleError(fallbackError);
          throw fallbackError;
        }
      }
      
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
    } catch (error: any) {
      // Проверяем, связана ли ошибка с таймаутом
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.warn(`Таймаут запроса к ${url}. Пробуем использовать резервный URL...`);
        try {
          // Создаем новый экземпляр axios с резервным URL
          const fallbackApi = axios.create({
            baseURL: API_CONFIG.fallbackUrl,
            timeout: API_CONFIG.timeout,
            withCredentials: API_CONFIG.withCredentials,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Пробуем выполнить запрос с резервным URL
          const fallbackResponse: AxiosResponse<T> = await fallbackApi.put(url, data, {
            ...config,
            withCredentials: true
          });
          
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Ошибка при использовании резервного URL:', fallbackError);
          this.handleError(fallbackError);
          throw fallbackError;
        }
      }
      
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
    } catch (error: any) {
      // Проверяем, связана ли ошибка с таймаутом
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        console.warn(`Таймаут запроса к ${url}. Пробуем использовать резервный URL...`);
        try {
          // Создаем новый экземпляр axios с резервным URL
          const fallbackApi = axios.create({
            baseURL: API_CONFIG.fallbackUrl,
            timeout: API_CONFIG.timeout,
            withCredentials: API_CONFIG.withCredentials,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Пробуем выполнить запрос с резервным URL
          const fallbackResponse: AxiosResponse<T> = await fallbackApi.delete(url, {
            ...config,
            withCredentials: true
          });
          
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Ошибка при использовании резервного URL:', fallbackError);
          this.handleError(fallbackError);
          throw fallbackError;
        }
      }
      
      this.handleError(error);
      throw error;
    }
  }
  
  // Tournament specific methods
  async getAllTournaments(): Promise<Tournament[]> {
    return this.get<Tournament[]>('/api/tournaments');
  }
  
  async getTournamentById(id: string): Promise<Tournament> {
    return this.get<Tournament>(`/api/tournaments/${id}`);
  }
  
  async getUpcomingTournaments(): Promise<Tournament[]> {
    return this.get<Tournament[]>('/api/tournaments/upcoming');
  }
  
  async getCompletedTournaments(): Promise<Tournament[]> {
    return this.get<Tournament[]>('/api/tournaments/completed');
  }
  
  async searchTournamentsByLocation(location: string): Promise<Tournament[]> {
    return this.get<Tournament[]>('/api/tournaments/search', { params: { location } });
  }
  
  async getBusinessTournaments(): Promise<Tournament[]> {
    return this.get<Tournament[]>('/api/tournaments/business');
  }
  
  // Admin methods for tournament management
  async createTournament(tournamentData: any): Promise<Tournament> {
    return this.post<Tournament>('/api/admin/tournaments', tournamentData);
  }
  
  async updateTournament(id: string, tournamentData: any): Promise<Tournament> {
    return this.put<Tournament>(`/api/admin/tournaments/${id}`, tournamentData);
  }
  
  async deleteTournament(id: string): Promise<void> {
    return this.delete<void>(`/api/admin/tournaments/${id}`);
  }
  
  async updateTeamStatus(tournamentId: string, teamId: string, status: RegistrationStatus): Promise<any> {
    return this.put<any>(`/api/admin/tournaments/${tournamentId}/teams/${teamId}`, { status });
  }
  
  // Team methods
  async getAllTeams(): Promise<Team[]> {
    return this.get<Team[]>('/api/teams');
  }
  
  async getTeamById(id: string): Promise<Team> {
    return this.get<Team>(`/api/teams/${id}`);
  }
  
  async searchTeamsByName(name: string): Promise<Team[]> {
    return this.get<Team[]>('/api/teams/search', { params: { name } });
  }
  
  async getTopTeams(limit: number = 10): Promise<Team[]> {
    return this.get<Team[]>('/api/teams/top', { params: { limit } });
  }
  
  async getTournamentTeams(tournamentId: string, status?: RegistrationStatus): Promise<TournamentTeam[]> {
    return this.get<TournamentTeam[]>(`/api/tournaments/${tournamentId}/teams`, status ? { params: { status } } : undefined);
  }
  
  // Registration methods
  async getTournamentRegistrations(tournamentId: string, status?: RegistrationStatus): Promise<Registration[]> {
    return this.get<Registration[]>(`/api/registrations`, { params: { tournamentId, ...(status ? { status } : {}) } });
  }
  
  async registerTeamForTournament(tournamentId: string, teamName: string): Promise<Registration> {
    return this.post<Registration>(`/api/registrations`, { tournamentId, teamName });
  }
  
  async addPlayerToRegistration(registrationId: string, userId: string): Promise<any> {
    return this.post<any>(`/api/registrations/${registrationId}/players`, { userId });
  }
  
  async removePlayerFromRegistration(registrationId: string, userId: string): Promise<any> {
    return this.delete<any>(`/api/registrations/${registrationId}/players/${userId}`);
  }
  
  // User methods
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/users/me');
  }
  
  async getUserById(userId: string): Promise<User> {
    return this.get<User>(`/api/users/${userId}`);
  }
  
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return this.put<User>(`/api/users/${userId}`, userData);
  }
  
  async searchUsers(query: string): Promise<User[]> {
    return this.get<User[]>('/api/users/search', { params: { query } });
  }
  
  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await this.post<any>('/api/auth/login', credentials);
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async register(userData: { 
    name: string; 
    email: string; 
    password: string; 
  }): Promise<any> {
    try {
      const response = await this.post<any>('/api/auth/register', userData);
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async refreshToken(token: string): Promise<any> {
    return this.post<any>('/api/auth/refresh-token', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  async logout(): Promise<any> {
    localStorage.removeItem('token');
    return this.post<void>('/api/auth/logout', {});
  }
  
  clearAuthToken() {
    localStorage.removeItem('token');
  }
}

export default ApiService.getInstance(); 