import { jwtDecode } from 'jwt-decode';
import { BaseApiService } from './BaseApiService';
import { APP_SETTINGS, BASE_PATH } from '../config/envConfig';
import { API_CONFIG } from '../config/api';
import { 
  LoginResponse, 
  User, 
  LoginCredentials, 
  RegisterData, 
  DecodedToken,
  UserProfile
} from '../interfaces/Auth';

export class AuthService extends BaseApiService {
  private static instance: AuthService;
  private readonly TOKEN_KEY: string;
  private readonly REFRESH_TOKEN_KEY: string;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    super(API_CONFIG.baseUrl);
    this.TOKEN_KEY = APP_SETTINGS.tokenStorageKey;
    this.REFRESH_TOKEN_KEY = APP_SETTINGS.refreshTokenStorageKey;
    
    // Мигрируем токены из разных форматов хранения
    import('../utils/tokenStorage').then(tokenStorage => {
      tokenStorage.migrateTokens();
      
      // Инициализируем токен из хранилища после миграции
      const token = this.getToken();
      if (token) {
        this.setAuthToken(token);
        this.startTokenRefreshTimer();
      }
    }).catch(error => {
      console.error('[AuthService] Error importing tokenStorage module:', error);
      
      // Fallback инициализация
      const token = this.getToken();
      if (token) {
        this.setAuthToken(token);
        this.startTokenRefreshTimer();
      }
    });
    
    // Логируем конфигурацию для отладки
    console.log('[AuthService] Initialized with baseUrl:', API_CONFIG.baseUrl);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticates a user and stores their token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('[AuthService] Attempting login for:', email);
      // Используем путь для endpoint auth/login согласно API бэкенда
      const response = await this.post<LoginResponse>('/auth/login', { email, password });
      
      if (response && response.data.token) {
        console.log('[AuthService] Login successful, setting tokens');
        this.setToken(response.data.token);
        this.setAuthToken(response.data.token);
        
        // Start the token refresh timer
        this.startTokenRefreshTimer();
      } else {
        console.error('[AuthService] Login response missing token');
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>('/auth/register', data);
      
      if (response && response.data.token) {
        this.setToken(response.data.token);
        this.setAuthToken(response.data.token);
        
        // Start the token refresh timer
        this.startTokenRefreshTimer();
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.clearAuthToken();
    this.stopTokenRefreshTimer();
    
    // Перенаправляем на страницу входа через HashRouter с относительным URL
    window.location.href = `${BASE_PATH}#/login`;
  }

  /**
   * Sets the authentication token
   */
  private setToken(token: string): void {
    console.log('[AuthService] Setting token in localStorage');
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('token', token); // Also save in legacy storage
  }

  /**
   * Sets the refresh token
   */
  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Removes the authentication token
   */
  private removeToken(): void {
    console.log('[AuthService] Removing tokens from localStorage');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('token'); // Legacy storage
  }

  /**
   * Removes the refresh token
   */
  private removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      console.log('[AuthService] No token found, user not authenticated');
      return false;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded || typeof decoded !== 'object' || !decoded.exp) {
        console.warn('[AuthService] Token validation failed: Invalid token structure');
        this.logout();
        return false;
      }
      
      const isValid = decoded.exp > Date.now() / 1000;
      
      // If token is expired, try to refresh
      if (!isValid) {
        console.log('[AuthService] Token expired, attempting refresh');
        this.refreshToken().catch(() => {
          console.warn("[AuthService] Token refresh failed");
          this.logout();
        });
        return false;
      }
      
      console.log('[AuthService] Token valid, user authenticated');
      return isValid;
    } catch (error) {
      console.error('[AuthService] Token validation error:', error);
      // Clean up invalid token
      this.logout();
      return false;
    }
  }

  /**
   * Refreshes the authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        console.warn('Refresh token failed: No token found');
        this.logout();
        return false;
      }

      // Используем endpoint для обновления токена
      const headers = {
        Authorization: `Bearer ${currentToken}`
      };
      
      // Используем custom headers через Axios request конфигурацию
      const response = await this.request<LoginResponse>({
        method: 'post',
        url: '/auth/refresh-token',
        data: {},
        headers
      });

      if (response && response.data && response.data.token) {
        this.setToken(response.data.token);
        this.setAuthToken(response.data.token);
        
        // Reset refresh timer
        this.startTokenRefreshTimer();
        
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Refresh token response is invalid', response);
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Starts the token refresh timer
   */
  private startTokenRefreshTimer(): void {
    // Clear any existing timers
    this.stopTokenRefreshTimer();
    
    const token = this.getToken();
    if (!token) return;
    
    try {
      // Decode the token to get expiration time
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return;
      
      // Get current time and expiration time in seconds
      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.exp;
      
      // Calculate when to refresh (5 minutes before expiration)
      const refreshAt = exp - now - 300;
      
      if (refreshAt <= 0) {
        // Token is about to expire or already expired, refresh immediately
        this.refreshToken();
        return;
      }
      
      // Set timer to refresh token
      console.log(`[AuthService] Setting token refresh timer for ${refreshAt} seconds from now`);
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshAt * 1000);
      
    } catch (error) {
      console.error('[AuthService] Error starting refresh timer:', error);
    }
  }

  /**
   * Stops the token refresh timer
   */
  private stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Checks if the current user has a specific role
   */
  hasRole(role: string): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded || !decoded.role) return false;
      
      // Check if the user's role matches the required role
      return decoded.role.toLowerCase() === role.toLowerCase();
    } catch (error) {
      console.error('[AuthService] Error checking role:', error);
      return false;
    }
  }

  /**
   * Returns the current user's role
   */
  getCurrentUserRole(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded || !decoded.role) return null;
      
      return decoded.role;
    } catch (error) {
      console.error('[AuthService] Error getting user role:', error);
      return null;
    }
  }

  /**
   * Returns the JWT token
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    // If token not found in primary storage, check legacy storage
    if (!token) {
      const legacyToken = localStorage.getItem('token');
      if (legacyToken) {
        // Migrate from legacy storage to current storage
        localStorage.setItem(this.TOKEN_KEY, legacyToken);
        localStorage.removeItem('token');
        return legacyToken;
      }
    }
    
    return token;
  }

  /**
   * Returns the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Gets the current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Декодируем токен для получения информации о пользователе
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Используем информацию из токена для создания объекта пользователя
      // Для более полной информации можно добавить запрос к API /user/profile
      const user: User = {
        id: parseInt(decoded.sub, 10),
        name: '',  // Имя может отсутствовать в токене
        email: '',  // Email может отсутствовать в токене
        role: decoded.role
      };
      
      // Можно дополнительно запросить полную информацию о пользователе с сервера
      // const response = await this.get<User>('/user/profile');
      // return response.data;
      
      return user;
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      throw error;
    }
  }

  /**
   * Gets the user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await this.get<UserProfile>(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('[AuthService] Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Updates the user profile
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.put<UserProfile>(`/profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('[AuthService] Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Checks if the current user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Checks if the current user is a business account
   */
  isBusiness(): boolean {
    return this.hasRole('business');
  }
} 