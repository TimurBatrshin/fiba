import ApiService from './ApiService';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  photoUrl?: string;
}

export const UserService = {
  // Получение списка всех пользователей
  async getAllUsers(): Promise<User[]> {
    return ApiService.get<User[]>('/users');
  },

  // Поиск пользователей по части имени
  async searchUsers(query: string): Promise<User[]> {
    return ApiService.get<User[]>('/users/search', { params: { query } });
  },

  // Получение информации о конкретном пользователе
  async getUserById(userId: string): Promise<User> {
    return ApiService.get<User>(`/users/${userId}`);
  }
}; 