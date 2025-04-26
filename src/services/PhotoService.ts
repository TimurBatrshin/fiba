import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { API_BASE_URL } from '../config/apiConfig';

interface PhotoResponse {
  photo_url: string;
}

export class PhotoService extends BaseApiService {
  private static instance: PhotoService;

  private constructor() {
    super();
  }

  public static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  /**
   * Get user's photo URL by user ID
   */
  public async getUserPhotoUrl(userId: string | number): Promise<string> {
    try {
      const response = await this.get<{ profile: { photo_url: string } }>(`/users/${userId}`);
      if (response.data.profile?.photo_url) {
        const photoUrl = response.data.profile.photo_url;
        return `${API_BASE_URL}/api${photoUrl}`;
      }
      return '';
    } catch (error) {
      console.error('Error fetching user photo:', error);
      return '';
    }
  }

  /**
   * Upload user's photo (requires authorization)
   */
  public async uploadUserPhoto(userId: string | number, photo: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await this.post<{ profile: { photo_url: string } }>(`/profile/${userId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.profile?.photo_url) {
        const photoUrl = response.data.profile.photo_url;
        return `${API_BASE_URL}/api${photoUrl}`;
      }
      return '';
    } catch (error) {
      console.error('Error uploading user photo:', error);
      throw error;
    }
  }

  /**
   * Delete user's photo (requires authorization)
   */
  public async deleteUserPhoto(userId: string | number): Promise<void> {
    try {
      await this.delete(`/profile/${userId}/photo`);
    } catch (error) {
      console.error('Error deleting user photo:', error);
      throw error;
    }
  }
} 