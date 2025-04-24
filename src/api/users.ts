import api from './client';
import { RegisterData, LoginCredentials, UserProfile, AuthResponse, User } from '../interfaces/Auth';
import { API_ENDPOINTS } from '../config/apiConfig';
import { APP_SETTINGS } from '../config/envConfig';

// Расширенные типы данных для пользователей
export interface ExtendedUser extends User {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends UserCredentials {
  username: string;
  firstName?: string;
  lastName?: string;
}

// API-функции для работы с аутентификацией и профилями пользователей
export const usersApi = {
  // Вход пользователя
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.auth.login, credentials);
    
    // Сохраняем токен в локальное хранилище
    if (response && response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
    }
    
    return response;
  },

  // Регистрация нового пользователя
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.auth.register, userData);
    
    // Сохраняем токен в локальное хранилище
    if (response && response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
    }
    
    return response;
  },

  // Обновление токена
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.auth.refreshToken);
    
    // Сохраняем новый токен в локальное хранилище
    if (response && response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
    }
    
    return response;
  },

  // Выход пользователя
  logout: (): void => {
    localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
  },

  // Получение профиля пользователя
  getProfile: async (): Promise<UserProfile> => {
    return api.get(API_ENDPOINTS.profile.get);
  },

  // Обновление профиля пользователя
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return api.put(API_ENDPOINTS.profile.update, profileData);
  },

  // Загрузка фотографии профиля
  uploadProfilePhoto: async (file: File, profileData?: Partial<UserProfile>): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    // Добавление дополнительных данных профиля, если они есть
    if (profileData) {
      if (profileData.tournaments_played) {
        formData.append('tournaments_played', profileData.tournaments_played.toString());
      }
      if (profileData.total_points) {
        formData.append('total_points', profileData.total_points.toString());
      }
      if (profileData.rating) {
        formData.append('rating', profileData.rating.toString());
      }
    }
    
    return api.post(API_ENDPOINTS.profile.uploadPhoto, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Получение данных текущего пользователя
  getCurrentUser: async (): Promise<ExtendedUser> => {
    return api.get('/users/me');
  },

  // Смена пароля
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    return api.post('/users/change-password', { oldPassword, newPassword });
  },

  // Загрузка аватара пользователя
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Получение списка пользователей (только для администраторов)
  getAllUsers: async (): Promise<ExtendedUser[]> => {
    return api.get('/users');
  }
};

export default usersApi; 