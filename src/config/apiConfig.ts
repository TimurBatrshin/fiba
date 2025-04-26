/**
 * Централизованная конфигурация API URL
 * Все URL бэкенда должны быть определены здесь и импортированы в других файлах
 */

import { API_BASE_URL, STATIC_URL, APP_SETTINGS } from './envConfig';

// Основной URL бэкенда
export const API_HOST = 'timurbatrshin-fiba-backend-5ef6.twc1.net';
export const API_PROTOCOL = 'https';
export const API_BASE_PATH = '/api';

// URL для статических ресурсов
export const STATIC_CONTENT_URL = STATIC_URL;

// Полный URL API - используем из envConfig для согласованности
export { API_BASE_URL };

// URL для статических ресурсов - используем из envConfig для согласованности
export { STATIC_URL };

// URL для прокси bro-js
export const PROXY_URL = `${API_PROTOCOL}://${API_HOST}${API_BASE_PATH}/proxy/static-bro-js`;

// Конфигурация для различных API точек
export const API_ENDPOINTS = {
  auth: {
    // Используем прямые пути без /api для прокси
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout'
  },
  profile: {
    get: '/profile',
    update: '/profile/update',
    uploadPhoto: '/profile/photo',
    getPhoto: (id: string | number) => `/profile/${id}/photo`
  },
  tournaments: {
    base: '/tournaments',
    byId: (id: string | number) => `/tournaments/${id}`,
    byStatus: (status: string) => `/tournaments/status/${status}`,
    upcoming: '/tournaments/upcoming',
    past: '/tournaments/past',
    search: '/tournaments/search',
    createTournament: '/tournaments',
    createBusinessTournament: '/tournaments/business',
    register: (id: string | number) => `/tournaments/${id}/register`
  },
  teams: {
    byRegistrationId: (id: string | number) => `/teams/${id}`
  },
  registrations: {
    byCaptain: '/registrations/captain',
    byPlayer: '/registrations/player',
    byTournament: (id: string | number) => `/registrations/tournament/${id}`,
    byTournamentAndStatus: (tournamentId: string | number, status: string) => 
      `/registrations/tournament/${tournamentId}/status/${status}`,
    create: '/registrations',
    update: (id: string | number) => `/registrations/${id}`,
    addPlayer: (id: string | number) => `/registrations/${id}/players`,
    removePlayer: (id: string | number, playerId: string | number) => 
      `/registrations/${id}/players/${playerId}`
  },
  players: {
    byId: (id: string | number) => `/players/${id}`,
    rankings: '/players/rankings',
    getBasicStats: (id: string | number) => `/players/${id}/stats/basic`,
    getDetailedStats: (id: string | number) => `/players/${id}/stats/detailed`,
    getStatistics: (id: string | number) => `/players/${id}/statistics`,
    search: '/players/search',
    updateRating: (id: string | number) => `/players/${id}/rating`
  },
  statistics: {
    topPlayers: '/players/rankings',
    playerRating: (playerId: string | number) => `/players/${playerId}`
  }
};

// Ключ для хранения статуса доступности API
export const API_STATUS_STORAGE_KEY = 'fiba_api_status';

// Функция для проверки доступности API
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
    
    const response = await fetch(`${API_PROTOCOL}://${API_HOST}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    const isAvailable = response.ok;
    localStorage.setItem(API_STATUS_STORAGE_KEY, JSON.stringify({
      available: isAvailable,
      checkedAt: new Date().toISOString()
    }));
    
    return isAvailable;
  } catch (e) {
    console.warn('API availability check failed', e);
    localStorage.setItem(API_STATUS_STORAGE_KEY, JSON.stringify({
      available: false,
      checkedAt: new Date().toISOString(),
      error: e instanceof Error ? e.message : 'Unknown error'
    }));
    return false;
  }
};

// Получение статуса API из localStorage
export const getApiStatus = (): { available: boolean, checkedAt: string, error?: string } => {
  try {
    const storedValue = localStorage.getItem(API_STATUS_STORAGE_KEY);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (e) {
    console.warn('Failed to get API status from localStorage', e);
  }
  
  return { available: false, checkedAt: new Date().toISOString() };
};

// Конфигурация для запросов
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: APP_SETTINGS.requestTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}; 