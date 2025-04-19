import { apiClient } from './client';

// Интерфейс для настройки прокси
interface ProxyConfig {
  targetUrl: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Прокси-сервис для работы с внешними API, не поддерживающими CORS
 */
export const proxyService = {
  /**
   * Выполняет GET-запрос через прокси-сервер
   * @param config Конфигурация прокси-запроса
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
      console.error('Proxy request error:', error);
      throw error;
    }
  },

  /**
   * Выполняет POST-запрос через прокси-сервер
   * @param config Конфигурация прокси-запроса
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
      console.error('Proxy request error:', error);
      throw error;
    }
  },

  /**
   * Загружает JavaScript-ресурс с внешнего URL через прокси
   * @param url URL скрипта
   * @returns Promise, который разрешается после загрузки скрипта
   */
  loadScript: (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Создаем script элемент
      const script = document.createElement('script');
      script.src = `/proxy/script?url=${encodeURIComponent(url)}`;
      script.async = true;
      
      // Обработчики событий
      script.onload = () => {
        console.log(`Скрипт успешно загружен через прокси: ${url}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`Ошибка загрузки скрипта через прокси: ${url}`, error);
        reject(error);
      };
      
      // Добавляем элемент в DOM
      document.head.appendChild(script);
    });
  },

  /**
   * Загружает CSS-ресурс с внешнего URL через прокси
   * @param url URL стилей
   * @returns Promise, который разрешается после загрузки стилей
   */
  loadStyle: (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Создаем link элемент
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/proxy/style?url=${encodeURIComponent(url)}`;
      
      // Обработчики событий
      link.onload = () => {
        console.log(`Стили успешно загружены через прокси: ${url}`);
        resolve();
      };
      
      link.onerror = (error) => {
        console.error(`Ошибка загрузки стилей через прокси: ${url}`, error);
        reject(error);
      };
      
      // Добавляем элемент в DOM
      document.head.appendChild(link);
    });
  }
};

export default proxyService; 