// Ключи для хранения токенов
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'fiba_auth_token',
  USER_DATA: 'fiba_user_data',
  REDIRECT_TIMESTAMP: 'auth_redirect_timestamp',
  REDIRECT_ATTEMPTS: 'auth_redirect_attempts'
} as const;

// Время жизни токенов (в секундах)
export const TOKEN_EXPIRATION = {
  AUTH_TOKEN: 24 * 60 * 60 // 24 часа
} as const;

// Legacy token key for backward compatibility
export const LEGACY_TOKEN_KEY = 'token'; 