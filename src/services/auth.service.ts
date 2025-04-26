import api from '../services/api';
import { LoginResponse } from '../interfaces/Auth';
import { getStoredToken, setStoredToken, removeStoredToken } from '../utils/tokenStorage';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    setStoredToken(token);
    return response.data;
  },

  register: async (name: string, email: string, password: string, role?: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token } = response.data;
    setStoredToken(token);
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await api.post('/auth/refresh-token');
    const { token: newToken } = response.data;
    setStoredToken(newToken);
    return response.data;
  },

  logout: (): void => {
    removeStoredToken();
  },

  isAuthenticated: (): boolean => {
    return !!getStoredToken();
  }
};

export { getStoredToken, setStoredToken, removeStoredToken }; 