import { apiClient } from './client';

// Интерфейс для настройки прокси-запроса
interface ProxyConfig {
  targetUrl: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Прокси-сервис для работы с внешними API, которые не поддерживают CORS
 */
export const proxyService = {
  /**
   * Выполняет GET-запрос через прокси-сервер
   * @param config Конфигурация запроса
   */
  get: async <T>(config: ProxyConfig): Promise<T> => {
    try {
      const response = await apiClient.post('/proxy', {
        method: 'GET',
        url: config.targetUrl,
        headers: config.headers,
        params: config.params
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка прокси-запроса:', error);
      throw error;
    }
  },

  /**
   * Выполняет POST-запрос через прокси-сервер
   * @param config Конфигурация запроса
   * @param data Данные для отправки
   */
  post: async <T>(config: ProxyConfig, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post('/proxy', {
        method: 'POST',
        url: config.targetUrl,
        headers: config.headers,
        params: config.params,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка прокси-запроса:', error);
      throw error;
    }
  }
};

export default proxyService; 