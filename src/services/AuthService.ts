import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { APP_SETTINGS } from '../config/envConfig';
import { API_CONFIG } from '../config/api';
import { 
  LoginResponse, 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  DecodedToken 
} from '../interfaces/Auth';

export class AuthService {
  private static instance: AuthService;
  private apiBaseUrl: string;
  private readonly TOKEN_KEY: string;

  private constructor() {
    this.apiBaseUrl = API_CONFIG.baseUrl;
    this.TOKEN_KEY = APP_SETTINGS.tokenStorageKey;
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
      const response = await axios.post(`${this.apiBaseUrl}/auth/login`, { email, password });
      
      if (response.data && response.data.token) {
        this.setToken(response.data.token);
        
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
  async register(data: RegisterData): Promise<void> {
    await axios.post(`${this.apiBaseUrl}/auth/register`, data);
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    this.removeToken();
    this.stopTokenRefreshTimer();
    
    // Redirect to login page с учетом базового пути для GitHub Pages
    const basePath = process.env.NODE_ENV === 'production' ? '/fiba' : '';
    window.location.href = `${basePath}/login`;
  }

  /**
   * Sets the authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Removes the authentication token
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // For backward compatibility, also remove from the legacy location
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

      const response = await axios.post(
        `${this.apiBaseUrl}/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );
      
      if (response && response.data.token) {
        this.setToken(response.data.token);
        this.startTokenRefreshTimer();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
    }
  }

  // Timer reference for token refresh
  private refreshTimer: NodeJS.Timeout | null = null;

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