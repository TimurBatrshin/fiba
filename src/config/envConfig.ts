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
    apiUrl: 'http://localhost:8080', // Backend server URL - default Spring Boot port
    enableLogging: true,
    staticUrl: 'http://localhost:8080/uploads/', // For uploaded files
    appBaseUrl: '/',
    msPath: '/ms'
  },
  production: {
    apiUrl: 'https://dev.bro-js.ru/api', // Production API endpoint
    enableLogging: false,
    staticUrl: 'https://dev.bro-js.ru/uploads/', // For uploaded files
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
  buildVersion: '1.6.9', // Точная версия согласно конфигурации стенда
  appName: 'fiba',
  tokenStorageKey: 'fiba_auth_token',
  refreshTokenStorageKey: 'fiba_refresh_token',
  userStorageKey: 'fiba_user_data',
  requestTimeout: 15000, // 15 seconds
  notificationDuration: 5000, // 5 seconds
  maxUploadSize: 10 * 1024 * 1024, // 10MB as specified in backend docs
  apiBaseUrl: config.apiUrl,
  staticUrl: config.staticUrl, 
  appBaseUrl: config.appBaseUrl,
  msPath: config.msPath,
  basePath: '/fiba3x3', // Base path for the application
  tokenExpiration: 86400000, // 24 hours in milliseconds
  refreshTokenExpiration: 604800000 // 7 days in milliseconds
};

// Service worker settings
export const SERVICE_WORKER_SETTINGS = {
  scope: '/'
}; 