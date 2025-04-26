import { BaseApiService } from './BaseApiService';
import { API_ENDPOINTS } from '../config/apiConfig';

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
      const response = await this.get<{ profile: { photo_url: string } }>(`/profile/${userId}`);
      if (response.data.profile?.photo_url) {
        return response.data.profile.photo_url.replace('/api', 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api');
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
  public async uploadUserPhoto(photo: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await this.post<{ profile: { photo_url: string } }>(API_ENDPOINTS.profile.uploadPhoto, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.profile?.photo_url) {
        return response.data.profile.photo_url.replace('/api', 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api');
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
  public async deleteUserPhoto(): Promise<void> {
    try {
      await this.delete(API_ENDPOINTS.profile.uploadPhoto);
    } catch (error) {
      console.error('Error deleting user photo:', error);
      throw error;
    }
  }
} 