import { AxiosResponse } from 'axios';
import { api } from './api';
import { setStoredToken, clearTokens } from '../utils/tokenStorage';
import { ILoginRequest, ILoginResponse } from '../types/auth';

export const login = async (data: ILoginRequest): Promise<ILoginResponse> => {
  const response: AxiosResponse<ILoginResponse> = await api.post('/auth/login', data);
  
  if (response.data.token) {
    setStoredToken(response.data.token);
  }
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('[AuthAPI] Error during logout:', error);
  } finally {
    clearTokens();
  }
}; 