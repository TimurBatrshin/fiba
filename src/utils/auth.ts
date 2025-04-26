import { STORAGE_KEYS } from '../constants/storage';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}; 