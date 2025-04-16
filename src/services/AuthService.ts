import ApiService from './ApiService';
import { APP_SETTINGS } from '../config/envConfig';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from 'jsonwebtoken';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    photoUrl?: string;
  };
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

export class AuthService {
  /**
   * Authenticates a user and stores their token
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response && response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
      localStorage.setItem('token', response.token);
      this.startTokenRefreshTimer();
    }
    
    return response;
  }

  /**
   * Registers a new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/auth/register', userData);
    
    if (response && response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
      localStorage.setItem('token', response.token);
      this.startTokenRefreshTimer();
    }
    
    return response;
  }

  /**
   * Logs out the current user
   */
  static logout(): void {
    localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
    localStorage.removeItem('token');
    this.stopTokenRefreshTimer();
    
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Checks if the user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(APP_SETTINGS.tokenStorageKey);
    if (!token) return false;
    
    // Check token expiration
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      return !!decodedToken.exp && decodedToken.exp > currentTime;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  /**
   * Refreshes the authentication token
   */
  private static async refreshToken(): Promise<void> {
    try {
      const response = await ApiService.post<{ token: string }>('/auth/refresh-token');
      
      if (response && response.token) {
        localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
        localStorage.setItem('token', response.token);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, log the user out
      this.logout();
    }
  }

  // Timer reference for token refresh
  private static refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Starts a timer to refresh the token before it expires
   */
  private static startTokenRefreshTimer(): void {
    // Clear any existing timer
    this.stopTokenRefreshTimer();
    
    // Refresh the token every 55 minutes (assuming token expiry is 1 hour)
    this.refreshTimer = setInterval(() => {
      this.refreshToken();
    }, 55 * 60 * 1000);
  }

  /**
   * Stops the token refresh timer
   */
  private static stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Checks if the user has a specific role
   */
  static hasRole(role: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const decodedToken = jwtDecode<JwtPayload & { roles?: string[] }>(token);
      return decodedToken.roles?.includes(role) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the current user's role
   */
  static getCurrentUserRole(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role.replace('ROLE_', '');
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  private static getToken(): string | null {
    return localStorage.getItem(APP_SETTINGS.tokenStorageKey);
  }
}

export default AuthService; 