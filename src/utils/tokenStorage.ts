import { STORAGE_KEYS, LEGACY_TOKEN_KEY } from '../constants/storage';

/**
 * Token storage implementation
 */
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    // Try to get token from new storage first
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) return token;

    // Fall back to legacy token if exists
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken) {
      // Migrate legacy token to new storage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      return legacyToken;
    }

    return null;
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    // Also remove legacy token if it exists
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
};

// Export individual functions that use the tokenStorage object
export const getStoredToken = tokenStorage.get;
export const setStoredToken = tokenStorage.set;
export const removeStoredToken = tokenStorage.remove;

/**
 * Clear all auth tokens and related data
 */
export const clearTokens = (): void => {
  tokenStorage.remove();
  // Clear related data
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.REDIRECT_TIMESTAMP);
  localStorage.removeItem(STORAGE_KEYS.REDIRECT_ATTEMPTS);
  console.log('All auth data cleared');
};

/**
 * Migrate legacy tokens to new format
 */
export const migrateTokens = (): void => {
  // Check for token in new format
  const newToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (newToken) {
    // If token exists in new format, clean up legacy
    clearTokens();
    // And save the new one
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    return;
  }

  // If no token in new format, check legacy
  const legacyToken = localStorage.getItem('token');
  if (legacyToken) {
    // If found in legacy format, migrate to new
    tokenStorage.set(legacyToken);
    // Remove legacy
    localStorage.removeItem('token');
  }
}; 