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
      try {
        // Оптимизированный путь через прокси
        // Проверяем, можем ли мы использовать локальную версию скрипта
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // Функция для загрузки через прокси (определена заранее для избежания ошибки strict mode)
        const loadViaProxy = () => {
          // Создаем script элемент через прокси
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
            
            // Последняя попытка: загрузка с режимом no-cors
            console.log(`Последняя попытка загрузки с режимом no-cors: ${url}`);
            const finalScript = document.createElement('script');
            finalScript.crossOrigin = 'anonymous'; // Попытка избежать CORS-ошибки
            finalScript.src = url;
            
            finalScript.onload = () => {
              console.log(`Скрипт успешно загружен с crossOrigin='anonymous': ${url}`);
              resolve();
            };
            
            finalScript.onerror = (finalError) => {
              console.error(`Окончательная ошибка загрузки скрипта: ${url}`, finalError);
              reject(finalError);
            };
            
            document.head.appendChild(finalScript);
          };
          
          // Добавляем элемент в DOM
          document.head.appendChild(script);
        };
        
        // Попытка использовать локальную версию скрипта
        if (url.includes('fiba') || url.includes('bro-js')) {
          // Проверяем наличие скрипта локально
          const localPath = `/assets/scripts/${fileName}`;
          fetch(localPath, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                // Локальная версия найдена, используем ее
                const script = document.createElement('script');
                script.src = localPath;
                script.async = true;
                
                script.onload = () => {
                  console.log(`Скрипт успешно загружен из локального пути: ${localPath}`);
                  resolve();
                };
                
                script.onerror = () => {
                  console.warn(`Не удалось загрузить скрипт из локального пути: ${localPath}, используем прокси`);
                  loadViaProxy();
                };
                
                document.head.appendChild(script);
              } else {
                // Локальная версия не найдена, используем прокси
                loadViaProxy();
              }
            })
            .catch(() => {
              // Ошибка проверки, используем прокси
              loadViaProxy();
            });
        } else {
          // Не fiba/bro-js скрипт, используем прокси
          loadViaProxy();
        }
      } catch (error) {
        console.error(`Ошибка при обработке загрузки скрипта: ${url}`, error);
        reject(error);
      }
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