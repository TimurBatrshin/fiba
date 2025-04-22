import apiService from './ApiService';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'business';
  avatar?: string;
  teams?: string[];
  createdAt: string;
  updatedAt: string;
  tournaments_played?: number;
  total_points?: number;
  rating?: number;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
  tournaments_played?: number;
  total_points?: number;
  rating?: number;
}

export class UserService {
  async getCurrentUser(): Promise<User> {
    return apiService.getCurrentUser();
  }
  
  async getUserById(id: string): Promise<User> {
    return apiService.getUserById(id);
  }
  
  async updateUser(id: string, userData: UserUpdateInput): Promise<User> {
    return apiService.updateUser(id, userData);
  }
  
  async login(email: string, password: string): Promise<any> {
    return apiService.login({ email, password });
  }
  
  async register(firstName: string, email: string, password: string, lastName: string = ''): Promise<any> {
    return apiService.register({ 
      email, 
      password, 
      firstName, 
      lastName 
    });
  }
  
  async logout(): Promise<void> {
    return apiService.logout();
  }
}

export default new UserService(); 