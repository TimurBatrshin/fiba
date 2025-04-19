/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import './app/styles/index.scss';
import App from './app';
import { APP_SETTINGS } from './config/envConfig';

// Конфигурация для скриптов
const APP_CONFIG = {
  version: APP_SETTINGS.buildVersion,
  devURL: 'https://dev.bro-js.ru/fiba/',
  staticURL: 'https://static.bro-js.ru/fiba/',
  localProxyURL: `/proxy/fiba/${APP_SETTINGS.buildVersion}/`,
  isMasterPath: window.location.pathname.includes('/fiba/master')
};

// Сохраняем оригинальную функцию fetch
const originalFetch = window.fetch;

/**
 * Загружает скрипт через DOM
 */
const loadScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Проверяем, не загружен ли скрипт уже
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      console.log(`Скрипт уже загружен: ${url}`);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log(`Скрипт загружен успешно: ${url}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Ошибка загрузки скрипта: ${url}`, error);
      reject(error);
    };
    
    document.head.appendChild(script);
    console.log(`Скрипт добавлен в DOM: ${url}`);
  });
};

/**
 * Преобразует URL для обхода CORS
 */
const transformURL = (url: string): string => {
  // Если URL относится к статическим ресурсам bro-js
  if (url.includes('static.bro-js.ru/fiba/') || url.includes('dev.bro-js.ru/fiba/')) {
    // Извлекаем путь после домена
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Если это JS файл, добавляем метку времени для предотвращения кэширования
    if (path.endsWith('.js')) {
      return `/proxy${path}?t=${Date.now()}`;
    }
    
    // Другие статические ресурсы
    return `/proxy${path}`;
  }
  
  // Для других URL ничего не меняем
  return url;
};

// Создаем прокси для fetch запросов
window.fetch = (async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  try {
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      return originalFetch(input, init);
    }
    
    // Проверяем, относится ли запрос к проблемным доменам
    if (url.includes('static.bro-js.ru/fiba/') || url.includes('dev.bro-js.ru/fiba/')) {
      console.log(`Перехват запроса: ${url}`);
      
      // Преобразуем URL для обхода CORS
      const proxyUrl = transformURL(url);
      console.log(`Преобразован в: ${proxyUrl}`);
      
      // Для JavaScript файлов
      if (url.endsWith('.js')) {
        try {
          // Пробуем загрузить через DOM
          await loadScript(proxyUrl);
          
          // Возвращаем успешный ответ
          return new Response('/* Script loaded */', {
            status: 200,
            headers: new Headers({
              'Content-Type': 'application/javascript'
            })
          });
        } catch (error) {
          console.error('Не удалось загрузить скрипт:', error);
          
          // В случае ошибки пробуем загрузить через оригинальный fetch с no-cors
          return originalFetch(proxyUrl, {
            ...init,
            mode: 'no-cors',
            cache: 'no-cache'
          });
        }
      }
      
      // Для остальных ресурсов используем прокси URL
      return originalFetch(proxyUrl, init);
    }
    
    // Все остальные запросы без изменений
    return originalFetch(input, init);
  } catch (error) {
    console.error('Ошибка в перехватчике fetch:', error);
    return originalFetch(input, init);
  }
}) as typeof fetch;

// Предзагрузка основного скрипта при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Пути для предзагрузки
    const scriptPaths = [
      `${APP_CONFIG.devURL}${APP_CONFIG.version}/index.js`,
      `${APP_CONFIG.staticURL}${APP_CONFIG.version}/index.js`
    ];
    
    // Предзагрузка скриптов
    scriptPaths.forEach(path => {
      const proxyPath = transformURL(path);
      console.log(`Предзагрузка скрипта: ${proxyPath}`);
      
      loadScript(proxyPath).catch(error => {
        console.warn(`Не удалось предзагрузить скрипт: ${path}`, error);
      });
    });
  } catch (e) {
    console.error('Ошибка при предзагрузке скриптов:', e);
  }
});

// Инициализация прокси-сервера на клиенте (ServiceWorker)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker зарегистрирован:', registration.scope);
      })
      .catch(error => {
        console.error('Ошибка регистрации ServiceWorker:', error);
      });
  });
}

// Расширяем интерфейс Module для поддержки webpack hot module replacement
declare global {
  interface Module {
    hot?: {
      accept(path: string, callback: () => void): void;
    };
  }
}
  
export default () => <App/>;
  
// Храним ссылку на DOM-элемент для размонтирования
let rootElement: HTMLElement | null = null;
  
export const mount = (Component: React.ComponentType<any>, element = document.getElementById('app')) => {
  if (!element) {
    console.error('Root element not found');
    return;
  }
  
  rootElement = element;
  ReactDOM.render(<Component/>, element);

  // Используем явное приведение типа для решения проблемы с module.hot
  // @ts-ignore - игнорируем проверку типов для module.hot
  if (module.hot) {
    // @ts-ignore - игнорируем проверку типов для module.hot.accept
    module.hot.accept('./app', () => {
      ReactDOM.render(<Component/>, element);
    });
  }
};

export const unmount = () => {
  if (rootElement) {
    ReactDOM.unmountComponentAtNode(rootElement);
    rootElement = null;
  }
};
