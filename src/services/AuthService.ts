import { jwtDecode } from 'jwt-decode';
import { BaseApiService } from './BaseApiService';
import { APP_SETTINGS } from '../config/envConfig';
import { API_CONFIG } from '../config/api';
import { 
  LoginResponse, 
  User, 
  LoginCredentials, 
  RegisterData, 
  DecodedToken 
} from '../interfaces/Auth';

export class AuthService extends BaseApiService {
  private static instance: AuthService;
  private readonly TOKEN_KEY: string;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    super(API_CONFIG.baseUrl);
    this.TOKEN_KEY = APP_SETTINGS.tokenStorageKey;
    
    // Инициализировать токен из хранилища
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
      this.startTokenRefreshTimer();
    }
    
    // Миграция старого токена
    this.migrateTokenIfNeeded();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Миграция токена из старого хранилища
   */
  private migrateTokenIfNeeded(): void {
    const legacyToken = localStorage.getItem('token');
    const newToken = localStorage.getItem(this.TOKEN_KEY);
    
    if (legacyToken && !newToken) {
      this.setToken(legacyToken);
      localStorage.removeItem('token');
    }
  }

  /**
   * Authenticates a user and stores their token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>('/auth/login', { email, password });
      
      if (response && response.token) {
        this.setToken(response.token);
        this.setAuthToken(response.token);
        
        // Start the token refresh timer
        this.startTokenRefreshTimer();
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(data: RegisterData): Promise<void> {
    await this.post('/auth/register', data);
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    this.removeToken();
    this.clearAuthToken();
    this.stopTokenRefreshTimer();
    
    // Redirect to login page с учетом базового пути для GitHub Pages
    const basePath = process.env.NODE_ENV === 'production' ? '/fiba3x3' : '';
    window.location.href = `${basePath}/login`;
  }

  /**
   * Sets the authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    // Больше не сохраняем в устаревшем месте
  }

  /**
   * Removes the authentication token
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // Для обратной совместимости также удаляем из старого места
    localStorage.removeItem('token');
  }

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const isValid = decoded.exp > Date.now() / 1000;
      
      // If token is expired, clean up
      if (!isValid) {
        this.logout();
        return false;
      }
      
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      // Clean up invalid token
      this.logout();
      return false;
    }
  }

  /**
   * Refreshes the authentication token
   */
  private async refreshToken(): Promise<void> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        this.logout();
        return;
      }

      const response = await this.post<{ token: string }>(
        '/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );
      
      if (response && response.token) {
        this.setToken(response.token);
        this.setAuthToken(response.token);
        this.startTokenRefreshTimer();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
    }
  }

  /**
   * Starts a timer to refresh the token before it expires
   */
  private startTokenRefreshTimer(): void {
    // Clear any existing timer
    this.stopTokenRefreshTimer();

    const token = this.getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      // Refresh 5 minutes before expiration or halfway through the lifetime if less than 10 minutes
      const refreshTime = Math.max(0, expiresIn < 600 ? expiresIn / 2 : (expiresIn - 300)) * 1000;
      
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    } catch (error) {
      console.error('Error starting token refresh timer:', error);
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
   * Checks if the user has a specific role
   */
  hasRole(role: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    try {
      const token = this.getToken();
      if (!token) return false;

      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the current user's role
   */
  getCurrentUserRole(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get the authentication token from storage
   */
  getToken(): string | null {
    // First try the primary location, then fall back to legacy location
    return localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem('token');
  }

  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): User {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authenticated user');
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.sub,
        username: '',  // These fields aren't in the token, would need to be fetched from API
        email: '',     // or stored separately
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 