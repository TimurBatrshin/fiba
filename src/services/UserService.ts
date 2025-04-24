import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { User, DecodedToken } from '../interfaces/Auth';
import { APP_SETTINGS } from '../config/envConfig';
import { getToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';

export interface UserUpdateInput {
  name?: string;
  email?: string;
  avatar?: string;
  password?: string;
  tournaments_played?: number;
  total_points?: number;
  rating?: number;
}

export class UserService extends BaseApiService {
  constructor() {
    super(API_CONFIG.baseUrl);
  }

  /**
   * Get token from storage
   */
  protected getToken(): string | null {
    return localStorage.getItem(APP_SETTINGS.tokenStorageKey) || localStorage.getItem('token');
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      // Получаем токен, проверяем его наличие
      const token = this.getToken();
      if (!token) {
        console.log('UserService: Token not found when getting current user');
        return null;
      }

      // Проверяем валидность токена
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        
        // Проверяем срок действия токена
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          console.log('UserService: Token expired when getting current user');
          return null;
        }

        // Если у нас нет userId в токене, не можем создать пользователя
        if (!decodedToken.sub) {
          console.log('UserService: Token missing required user data');
          return null;
        }

        // Создаем объект пользователя из данных токена
        const user: User = {
          id: parseInt(decodedToken.sub, 10),
          email: decodedToken.email || '',
          name: decodedToken.name || '',
          role: decodedToken.role
        };

        console.log('UserService: Successfully decoded user from token');
        return user;
      } catch (decodeError) {
        console.error('UserService: Error decoding token:', decodeError);
        return null;
      }
    } catch (error) {
      console.error('UserService: Unexpected error getting current user:', error);
      return null;
    }
  }
  
  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User> {
    const response = await this.get<User>(`/users/${id}`);
    return response.data;
  }
  
  /**
   * Update user profile
   */
  public async updateUser(id: string, userData: UserUpdateInput): Promise<User> {
    const response = await this.put<User>(`/users/${id}`, userData);
    return response.data;
  }
  
  /**
   * Get list of top users by rating
   */
  public async getTopUsers(limit: number = 10): Promise<User[]> {
    const response = await this.get<User[]>('/users/top', { limit });
    return response.data;
  }
  
  /**
   * Search users by name or email
   */
  public async searchUsers(query: string): Promise<User[]> {
    const response = await this.get<User[]>('/users/search', { query });
    return response.data;
  }
  
  /**
   * Upload profile photo for user
   * @param userId User ID
   * @param photo Photo file
   * @param profileData Optional additional profile data
   */
  public async uploadProfilePhoto(userId: string | number, photo: File): Promise<any> {
    try {
      // При загрузке для конкретного пользователя используем эндпоинт с id
      const endpoint = `/profile/${userId}/photo`;
      
      // Используем общий метод для загрузки файла БЕЗ дополнительных данных
      return await this.uploadFile(endpoint, photo); // Убрали additionalData
    } catch (error) {
      console.error('[UserService] Error uploading profile photo:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService(); 