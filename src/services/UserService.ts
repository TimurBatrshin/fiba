import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { User } from '../interfaces/Auth';

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
    super(API_CONFIG.baseUrl, API_CONFIG.mockUrl, API_CONFIG.useMockByDefault);
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<User> {
    const response = await this.get<User>('/users/me');
    return response.data;
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
}

// Create and export a singleton instance
export const userService = new UserService(); 