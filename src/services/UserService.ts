import { BaseApiService } from './BaseApiService';
import { User, UserProfile } from '../interfaces/Auth';
import { API_ENDPOINTS, API_BASE_URL } from '../config/apiConfig';

export interface ProfileUpdateInput {
  photo?: File;
  email?: string;
  name?: string;
}

export class UserService extends BaseApiService {
  private static instance: UserService;

  constructor() {
    super();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<UserProfile> {
    const response = await this.get<UserProfile>('/users/me');
    return response.data;
  }

  /**
   * Update user profile
   */
  public async updateProfile(data: ProfileUpdateInput): Promise<UserProfile> {
    const formData = new FormData();
    
    if (data.photo) formData.append('photo', data.photo);
    if (data.email) formData.append('email', data.email);
    if (data.name) formData.append('name', data.name);
    
    const response = await this.post<UserProfile>(API_ENDPOINTS.profile.update, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<UserProfile> {
    const response = await this.get<UserProfile>(`/users/${id}`);
    return response.data;
  }
  
  /**
   * Get list of top users by rating
   */
  public async getTopUsers(limit: number = 10): Promise<UserProfile[]> {
    const response = await this.get<UserProfile[]>('/users/top', { limit });
    return response.data;
  }
  
  /**
   * Search users by name or email
   */
  public async searchUsers(query: string): Promise<UserProfile[]> {
    const response = await this.get<UserProfile[]>('/users/search', { query });
    return response.data;
  }

  /**
   * Upload profile photo
   */
  public async uploadProfilePhoto(photo: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await this.post<UserProfile>(API_ENDPOINTS.profile.uploadPhoto, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Get profile photo URL
   */
  public getProfilePhotoUrl(photoUrl: string | null | undefined): string {
    if (!photoUrl) return '';
    return `${API_BASE_URL}${photoUrl}`;
  }

  /**
   * Get user profile photo URL by user ID
   */
  public async getUserPhotoUrl(userId: string | number): Promise<string> {
    try {
      const userData = await this.getUserById(userId.toString());
      if (userData?.profile?.photo_url) {
        return this.getProfilePhotoUrl(userData.profile.photo_url);
      }
      return '';
    } catch (error) {
      console.error('Error fetching user photo:', error);
      return '';
    }
  }
}

// Create and export a singleton instance
export const userService = UserService.getInstance(); 