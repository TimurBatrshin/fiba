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
    apiUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api',
    enableLogging: true
  },
  production: {
    apiUrl: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net/api',
    enableLogging: false
  }
};

// Current environment configuration
const currentEnv = isProduction ? 'production' : 'development';
const config = ENV_CONFIG[currentEnv];

// Export API URLs
export const API_BASE_URL = config.apiUrl;

// App Settings
export const APP_SETTINGS = {
  enableLogging: config.enableLogging,
  buildVersion: '1.0.18',
  tokenStorageKey: 'auth_token',
  userStorageKey: 'user_data',
  requestTimeout: 15000, // 15 seconds
  notificationDuration: 5000, // 5 seconds
  maxUploadSize: 5 * 1024 * 1024 // 5MB
};

// Service worker settings
export const SERVICE_WORKER_SETTINGS = {
  scope: '/'
}; 