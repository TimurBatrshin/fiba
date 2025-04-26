/**
 * Централизованная конфигурация для переменных окружения
 */

import { STORAGE_KEYS, TOKEN_EXPIRATION } from '../constants/storage';

// Базовая конфигурация
const CONFIG = {
  apiUrl: 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api',
  enableLogging: true,
  staticUrl: 'https://timurbatrshin-fiba-backend-5ef6.twc1.net',
  appBaseUrl: '/',
  msPath: '/ms',
  basePath: '/fiba3x3'
};

// Экспорт API URLs
export const API_BASE_URL = CONFIG.apiUrl;
export const STATIC_URL = CONFIG.staticUrl;
export const APP_BASE_URL = CONFIG.appBaseUrl;
export const MS_PATH = CONFIG.msPath;
export const BASE_PATH = CONFIG.basePath;

// Настройки приложения
export const APP_SETTINGS = {
  enableLogging: CONFIG.enableLogging,
  buildVersion: '1.0.0',
  appName: 'FIBA Tournament Manager',
  
  // API настройки
  apiBaseUrl: CONFIG.apiUrl,
  requestTimeout: 30000, // 30 секунд
  
  // Настройки токенов
  tokenStorageKey: STORAGE_KEYS.AUTH_TOKEN,
  userStorageKey: STORAGE_KEYS.USER_DATA,
  
  // Время жизни токенов
  tokenExpiration: TOKEN_EXPIRATION.AUTH_TOKEN,
  
  // Настройки UI
  notificationDuration: 5000, // 5 секунд
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxTeamSize: 4,
  minTeamSize: 3,
  
  // Настройки пагинации
  defaultPageSize: 10,
  maxPageSize: 50
} as const;

// Настройки Service Worker
export const SERVICE_WORKER_SETTINGS = {
  scope: '/'
}; 