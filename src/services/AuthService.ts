import { jwtDecode } from 'jwt-decode';
import { BaseApiService } from './BaseApiService';
import { APP_SETTINGS } from '../config/envConfig';
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
      const response = await this.post<LoginResponse>('/api/auth/login', { email, password });
      
      if (response && response.data.token) {
        this.setToken(response.data.token);
        this.setAuthToken(response.data.token);
        
        // Start the token refresh timer
        this.startTokenRefreshTimer();
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>('/api/auth/register', data);
      
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
    
    // Redirect to login page с учетом базового пути для GitHub Pages
    const basePath = process.env.NODE_ENV === 'production' ? '/fiba3x3' : '';
    
    // Формируем корректный URL для редиректа с учетом базового пути
    if (basePath && !window.location.pathname.startsWith(basePath)) {
      // Если мы не в baseUrl, то используем абсолютный путь
      window.location.href = `${window.location.origin}${basePath}/login`;
    } else {
      // Используем относительный путь
      window.location.href = `${basePath}/login`;
    }
  }

  /**
   * Sets the authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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
    
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const isValid = decoded.exp > Date.now() / 1000;
      
      // If token is expired, try to refresh
      if (!isValid) {
        this.refreshToken().catch(() => this.logout());
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
  async refreshToken(): Promise<void> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        this.logout();
        return;
      }

      const response = await this.post<{ token: string }>(
        '/api/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );
      
      if (response && response.data.token) {
        this.setToken(response.data.token);
        this.setAuthToken(response.data.token);
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
  hasRole(role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER'): boolean {
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
  getCurrentUserRole(): 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER' | null {
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
   * Get the refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Gets the current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.get<User>('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  /**
   * Gets the profile for the current user
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await this.get<UserProfile>(`/api/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Updates the user profile
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.put<UserProfile>(`/api/profiles/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Checks if the user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Checks if the user is a coach
   */
  isCoach(): boolean {
    return this.hasRole('COACH');
  }

  /**
   * Checks if the user is an organizer
   */
  isOrganizer(): boolean {
    return this.hasRole('ORGANIZER');
  }
} 