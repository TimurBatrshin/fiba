import { API_CONFIG as ApiConfigFromCentral } from './apiConfig';

export const API_CONFIG = {
  baseUrl: 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api',
  TOURNAMENTS_PATH: '/tournaments',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}; 