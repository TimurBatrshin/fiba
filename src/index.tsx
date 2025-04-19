/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './app/styles/index.scss';
import App from './app';
// Импортируем CORS-утилиты
import { transformURL, loadScriptNoCORS, fetchAndEvalScript } from './utils/corsHelper';
// Импортируем настройки приложения
import { APP_SETTINGS } from './config/envConfig';

// Сохраняем оригинальную функцию fetch
const originalFetch = window.fetch;

// Конфигурация для скриптов bro-js
const FIBA_CONFIG = {
  version: APP_SETTINGS.buildVersion, // Используем версию из envConfig
  baseUrl: 'https://static.bro-js.ru/fiba/',
  isMasterPath: false
};

// Определяем, какую версию скрипта использовать на основе текущего пути
if (window.location.pathname.includes('/fiba/master')) {
  console.log('Detected master path, using latest version');
  // Для пути /fiba/master используем текущую версию из конфигурации
  FIBA_CONFIG.isMasterPath = true;
}

// Переопределяем fetch для обработки CORS ошибок
window.fetch = (async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  // Обрабатываем запросы к static.bro-js.ru специально, для остальных используем стандартный fetch
  try {
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      // Если не можем определить URL, передаем запрос исходному fetch
      return originalFetch(input, init);
    }
    
    // Специальная обработка для конкретного URL-адреса с проблемой CORS
    if (url === `${FIBA_CONFIG.baseUrl}${FIBA_CONFIG.version}/index.js` || 
        url.startsWith('https://static.bro-js.ru/fiba/') && url.endsWith('.js')) {
      
      // Для master пути заменяем все версии на текущую
      if (FIBA_CONFIG.isMasterPath) {
        // Извлекаем версию из URL, если она там есть
        const versionMatch = url.match(/\/fiba\/([^\/]+)\/index\.js/);
        if (versionMatch && versionMatch[1]) {
          const urlVersion = versionMatch[1];
          if (urlVersion !== FIBA_CONFIG.version) {
            console.log(`Master path: redirecting from version ${urlVersion} to ${FIBA_CONFIG.version}`);
            url = url.replace(`/fiba/${urlVersion}/`, `/fiba/${FIBA_CONFIG.version}/`);
          }
        }
      }
      
      // Перенаправляем запросы к старой версии на новую
      if (url.includes('/fiba/1.0.2/')) {
        console.log('Redirecting request from old version 1.0.2 to current version:', FIBA_CONFIG.version);
        url = url.replace('/fiba/1.0.2/', `/fiba/${FIBA_CONFIG.version}/`);
      }
      
      console.log('Intercepting critical request to static.bro-js.ru:', url);
      
      try {
        // Попытка загрузить через XMLHttpRequest с режимом no-cors
        await fetchAndEvalScript(url);
        
        // Возвращаем пустой успешный ответ
        return new Response('/* Script loaded via custom loader */', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/javascript'
          })
        });
      } catch (scriptError) {
        console.error('Failed to load script with custom loader:', scriptError);
        // Продолжаем обычной обработкой
      }
    }
    
    // Проверяем, относится ли запрос к static.bro-js.ru
    if (url.includes('static.bro-js.ru')) {
      console.log('Intercepting request to static.bro-js.ru:', url);
      
      // Особая обработка для JS файлов
      if (url.endsWith('.js')) {
        console.log('Loading script via DOM instead of fetch:', url);
        
        // Загружаем скрипт через DOM
        try {
          await loadScriptNoCORS(url);
        } catch (error) {
          console.error('Failed to load script via DOM, trying eval:', error);
          await fetchAndEvalScript(url);
        }
        
        // Возвращаем пустой успешный ответ
        return new Response('/* Script loaded via DOM */', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/javascript'
          })
        });
      }
      
      // Для остальных ресурсов с статического домена
      // создаем новый запрос с mode: 'no-cors'
      return originalFetch(url, {
        ...(init || {}),
        mode: 'no-cors',
        credentials: 'include'
      });
    } else if (typeof input === 'string') {
      // Для обычных строковых URL используем трансформацию
      return originalFetch(transformURL(input), init);
    }
    
    // Для всех остальных случаев используем оригинальный fetch
    return originalFetch(input, init);
  } catch (error) {
    console.error('Error in fetch interceptor:', error);
    // В случае ошибки возвращаем оригинальный fetch
    return originalFetch(input, init);
  }
}) as typeof fetch;

// При загрузке страницы пытаемся предзагрузить основной скрипт
document.addEventListener('DOMContentLoaded', () => {
  // Определяем, какой скрипт загружать в зависимости от пути
  const mainScriptUrl = `${FIBA_CONFIG.baseUrl}${FIBA_CONFIG.version}/index.js`;
  console.log('Pre-loading main script:', mainScriptUrl, 
              FIBA_CONFIG.isMasterPath ? '(from master path)' : '');
  
  // Используем наши специальные утилиты вместо прямого DOM метода
  loadScriptNoCORS(mainScriptUrl)
    .catch(error => {
      console.error('Error loading script via no-CORS method:', error);
      // Если не удалось загрузить через DOM, пробуем fetchAndEval
      fetchAndEvalScript(mainScriptUrl)
        .catch(e => console.error('Failed to eval script:', e));
    });
});

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
