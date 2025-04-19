import api from './client';

// Типы данных для пользователей
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
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

// API-функции для работы с пользователями
export const usersApi = {
  // Вход пользователя
  login: async (credentials: UserCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', credentials);
    
    // Сохраняем токен в локальное хранилище
    if (response && response.token) {
      localStorage.setItem('fiba3x3_auth_token', response.token);
    }
    
    return response;
  },

  // Регистрация нового пользователя
  register: async (userData: RegistrationData): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', userData);
    
    // Сохраняем токен в локальное хранилище
    if (response && response.token) {
      localStorage.setItem('fiba3x3_auth_token', response.token);
    }
    
    return response;
  },

  // Выход пользователя
  logout: (): void => {
    localStorage.removeItem('fiba3x3_auth_token');
  },

  // Получение данных текущего пользователя
  getCurrentUser: async (): Promise<User> => {
    return api.get('/users/me');
  },

  // Обновление данных пользователя
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return api.put('/users/me', userData);
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
  getAllUsers: async (): Promise<User[]> => {
    return api.get('/users');
  }
};

export default usersApi; 