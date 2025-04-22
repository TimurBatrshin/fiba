/**
 * Central configuration for environment variables
 * Supports multiple environments and fallbacks
 */

// Environment detection
export const isProduction = window.location.hostname !== 'localhost';
export const isDevelopment = !isProduction;

// Environment-specific configurations
const ENV_CONFIG = {
  development: {
    apiUrl: 'https://timurbatrshin-fiba-backend-e32e.twc1.net/api',
    enableLogging: true,
    staticUrl: 'https://timurbatrshin-fiba-backend-e32e.twc1.net/static/',
    appBaseUrl: '/',
    msPath: '/ms'
  },
  production: {
    apiUrl: 'https://timurbatrshin-fiba-backend-e32e.twc1.net/api',
    enableLogging: false,
    staticUrl: 'https://timurbatrshin-fiba-backend-e32e.twc1.net/static/',
    appBaseUrl: '/',
    msPath: '/ms'
  }
};

// Current environment configuration
const currentEnv = isProduction ? 'production' : 'development';
const config = ENV_CONFIG[currentEnv];

// Export API URLs
export const API_BASE_URL = config.apiUrl;
export const STATIC_URL = config.staticUrl;
export const APP_BASE_URL = config.appBaseUrl;
export const MS_PATH = config.msPath;

// App Settings
export const APP_SETTINGS = {
  enableLogging: config.enableLogging,
  buildVersion: '1.6.3', // Точная версия согласно конфигурации стенда
  appName: 'fiba',
  tokenStorageKey: 'fiba_auth_token',
  userStorageKey: 'fiba_user_data',
  requestTimeout: 15000, // 15 seconds
  notificationDuration: 5000, // 5 seconds
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  apiBaseUrl: config.apiUrl,
  staticUrl: config.staticUrl, 
  appBaseUrl: config.appBaseUrl,
  msPath: config.msPath,
  basePath: '/fiba3x3' // Base path for the application
};

// Service worker settings
export const SERVICE_WORKER_SETTINGS = {
  scope: '/'
}; 