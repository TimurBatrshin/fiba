/**
 * Централизованная конфигурация для переменных окружения
 */

// Базовая конфигурация
const CONFIG = {
  apiUrl: 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api',
  enableLogging: true,
  staticUrl: 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/uploads/',
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
  buildVersion: '1.7.2',
  appName: 'fiba',
  tokenStorageKey: 'fiba_auth_token',
  refreshTokenStorageKey: 'fiba_refresh_token',
  userStorageKey: 'fiba_user_data',
  requestTimeout: 15000, // 15 секунд
  notificationDuration: 5000, // 5 секунд
  maxUploadSize: 10 * 1024 * 1024, // 10MB согласно документации бэкенда
  apiBaseUrl: CONFIG.apiUrl,
  staticUrl: CONFIG.staticUrl, 
  appBaseUrl: CONFIG.appBaseUrl,
  msPath: CONFIG.msPath,
  basePath: CONFIG.basePath,
  tokenExpiration: 86400000, // 24 часа в миллисекундах
  refreshTokenExpiration: 604800000 // 7 дней в миллисекундах
};

// Настройки Service Worker
export const SERVICE_WORKER_SETTINGS = {
  scope: '/'
}; 