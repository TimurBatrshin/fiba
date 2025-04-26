import api from './client';
import { APP_SETTINGS } from '../config/envConfig';

// Интерфейсы для аутентификации
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

// Сервис аутентификации
const AuthService = {
  // Вход в систему
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Сохранение токена в localStorage
    if (response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
      localStorage.setItem(APP_SETTINGS.userStorageKey, JSON.stringify({
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role
      }));
    }
    
    return response;
  },
  
  // Регистрация
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Сохранение токена в localStorage
    if (response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
      localStorage.setItem(APP_SETTINGS.userStorageKey, JSON.stringify({
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role
      }));
    }
    
    return response;
  },
  
  // Выход из системы
  logout: (): void => {
    localStorage.removeItem(APP_SETTINGS.tokenStorageKey);
    localStorage.removeItem(APP_SETTINGS.refreshTokenStorageKey);
    localStorage.removeItem(APP_SETTINGS.userStorageKey);
  },
  
  // Обновление токена
  refreshToken: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem(APP_SETTINGS.tokenStorageKey);
    
    if (!token) {
      throw new Error('Token not found');
    }
    
    const response = await api.post<AuthResponse>('/auth/refresh-token', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.token) {
      localStorage.setItem(APP_SETTINGS.tokenStorageKey, response.token);
      localStorage.setItem(APP_SETTINGS.userStorageKey, JSON.stringify({
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role
      }));
    }
    
    return response;
  },
  
  // Получение текущего пользователя
  getCurrentUser: () => {
    const userJson = localStorage.getItem(APP_SETTINGS.userStorageKey);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },
  
  // Проверка, авторизован ли пользователь
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(APP_SETTINGS.tokenStorageKey);
  }
};

export default AuthService; 