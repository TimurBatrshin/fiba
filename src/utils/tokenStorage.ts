const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Список legacy ключей, которые нужно удалить
const LEGACY_KEYS = [
  'token',
  'fiba_auth_token',
  'fiba_refresh_token',
  'fiba_user_data'
];

/**
 * Мигрировать токены из всех возможных мест хранения в текущий формат
 */
export const migrateTokens = (): void => {
  console.log('[TokenStorage] Checking for legacy tokens to migrate');
  
  // Проверяем существование legacy токенов
  const legacyToken = localStorage.getItem('token') || localStorage.getItem('fiba_auth_token');
  const legacyRefreshToken = localStorage.getItem('fiba_refresh_token');
  
  // Если находим legacy токен и нет текущего, то миграция
  if (legacyToken && !localStorage.getItem(TOKEN_KEY)) {
    console.log('[TokenStorage] Found legacy token, migrating to new format');
    localStorage.setItem(TOKEN_KEY, legacyToken);
  }
  
  // Если находим legacy refresh токен и нет текущего, то миграция
  if (legacyRefreshToken && !localStorage.getItem(REFRESH_TOKEN_KEY)) {
    console.log('[TokenStorage] Found legacy refresh token, migrating to new format');
    localStorage.setItem(REFRESH_TOKEN_KEY, legacyRefreshToken);
  }
  
  // Удаляем все legacy ключи
  LEGACY_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`[TokenStorage] Removing legacy key: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Store the JWT token in localStorage
 */
export const setToken = (token: string): void => {
  console.log('[TokenStorage] Setting auth token');
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get the JWT token from localStorage
 */
export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('[TokenStorage] No auth token found');
  } else {
    console.log('[TokenStorage] Auth token found');
  }
  return token;
};

/**
 * Remove the JWT token from localStorage
 */
export const removeToken = (): void => {
  console.log('[TokenStorage] Removing auth token');
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store the refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  console.log('[TokenStorage] Setting refresh token');
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!token) {
    console.log('[TokenStorage] No refresh token found');
  } else {
    console.log('[TokenStorage] Refresh token found');
  }
  return token;
};

/**
 * Remove the refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  console.log('[TokenStorage] Removing refresh token');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all auth tokens
 */
export const clearTokens = (): void => {
  console.log('[TokenStorage] Clearing all tokens');
  removeToken();
  removeRefreshToken();
  
  // Очистка всех возможных мест хранения токенов
  localStorage.removeItem('auth_redirect_timestamp');
  localStorage.removeItem('auth_redirect_attempts');
}; 