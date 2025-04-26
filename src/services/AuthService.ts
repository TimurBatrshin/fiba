import { AxiosResponse, AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants/storage';
import { DecodedToken, LoginResponse, UserProfile, User, LoginCredentials, RegisterData, UserRole } from '../interfaces/Auth';
import { getStoredToken, setStoredToken, removeStoredToken } from '../utils/tokenStorage';
import { BaseApiService } from './BaseApiService';

export class AuthService extends BaseApiService {
  private static instance: AuthService;
  private TOKEN_KEY: string = STORAGE_KEYS.AUTH_TOKEN;
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    super();
    const storedToken = getStoredToken();
    if (storedToken) {
      this.validateAndSetToken(storedToken);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private handleError(error: any): Error {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message;
      console.error('Auth error:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data
      });
      return new Error(errorMessage || 'Authentication failed. Please try again.');
    }
    return error;
  }

  private validateAndSetToken(token: string): boolean {
    try {
      if (!token) {
        console.log('No token provided');
        return false;
      }

      // Decode and validate token
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Проверяем обязательные поля
      if (!decoded.exp) {
        console.error('Token missing expiration');
        return false;
      }

      const currentTime = Date.now() / 1000;
      
      // Проверка времени
      if (decoded.exp <= currentTime) {
        console.log('Token has expired', {
          expiration: new Date(decoded.exp * 1000).toISOString(),
          currentTime: new Date(currentTime * 1000).toISOString()
        });
        this.logout();
        return false;
      }

      // Проверка "not before" если есть
      if (decoded.nbf && decoded.nbf > currentTime) {
        console.log('Token not yet valid', {
          notBefore: new Date(decoded.nbf * 1000).toISOString(),
          currentTime: new Date(currentTime * 1000).toISOString()
        });
        return false;
      }

      // Проверка issued at если есть
      if (decoded.iat && decoded.iat > currentTime) {
        console.log('Token issued in future', {
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          currentTime: new Date(currentTime * 1000).toISOString()
        });
        return false;
      }

      // Проверяем наличие необходимых пользовательских данных
      if (!decoded.sub && !decoded.userId) {
        console.error('Token missing user identifier');
        return false;
      }

      // Set token in service and axios instance
      this.token = token;
      setStoredToken(token);
      
      // Ensure token is set in axios instance
      if (this.axiosInstance.defaults.headers.common) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        this.axiosInstance.defaults.headers.common = {
          'Authorization': `Bearer ${token}`
        };
      }
      
      // Log token state for debugging
      console.log('Token validation successful:', {
        tokenSet: !!this.token,
        axiosHeaders: this.axiosInstance.defaults.headers.common['Authorization'],
        expiration: new Date(decoded.exp * 1000).toISOString(),
        userId: decoded.sub || decoded.userId,
        role: decoded.role
      });

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Authenticates a user and stores their token
   */
  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data } = await this.post<LoginResponse>('/auth/login', { email, password });
      if (data.token) {
        const success = this.validateAndSetToken(data.token);
        if (!success) {
          throw new Error('Failed to validate and set token after login');
        }
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Registers a new user
   */
  public async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<LoginResponse> {
    try {
      const { data } = await this.post<LoginResponse>('/auth/register', userData);
      if (data.token) {
        const success = this.validateAndSetToken(data.token);
        if (!success) {
          throw new Error('Failed to validate and set token after registration');
        }
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logs out the current user
   */
  public logout(): void {
    this.currentUser = null;
    this.token = null;
    
    // Clear token from axios instance
    if (this.axiosInstance.defaults.headers.common) {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
    
    removeStoredToken();
  }

  /**
   * Checks if the user is authenticated
   */
  public isAuthenticated(): boolean {
    if (!this.token) return false;
    return this.validateAndSetToken(this.token);
  }

  /**
   * Gets the current user
   */
  public async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;
    
    try {
      const response = await this.get<User>('/auth/me');
      this.currentUser = response.data;
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.logout();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Gets a user's profile
   */
  public async getUserProfile(): Promise<UserProfile> {
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    try {
      const response = await this.get<UserProfile>('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.logout();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Updates a user's profile
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    try {
      await this.put('/users/profile', profile);
      return true;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.logout();
      }
      return false;
    }
  }

  /**
   * Checks if the current user has a specific role
   */
  public hasRole(requiredRole: UserRole): boolean {
    try {
      if (!this.isAuthenticated()) return false;
      
      const decoded = jwtDecode(this.token!) as DecodedToken;
      return decoded.role === requiredRole;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Gets the current user's role
   */
  getCurrentUserRole(): UserRole | null {
    return this.currentUser?.role || null;
  }

  /**
   * Checks if the current user is an admin
   */
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Checks if the current user is a business user
   */
  public isBusiness(): boolean {
    return this.hasRole('business');
  }

  public getToken(): string | null {
    return this.token;
  }
}

export const authService = AuthService.getInstance(); 