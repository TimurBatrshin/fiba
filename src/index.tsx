/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './app/styles/index.scss';
import App from './app';
// Импортируем CORS-утилиты
import { transformURL, loadScriptNoCORS, fetchAndEvalScript } from './utils/corsHelper';

// Сохраняем оригинальную функцию fetch
const originalFetch = window.fetch;

// Переопределяем fetch для обработки CORS ошибок
window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Обрабатываем запросы к static.bro-js.ru специально, для остальных используем стандартный fetch
  try {
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      // Если не можем определить URL, передаем запрос исходному fetch
      return originalFetch(input, init);
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
        return new Response('', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'application/javascript'
          })
        });
      }
      
      // Для остальных ресурсов с статического домена
      let newInput: RequestInfo;
      let newInit = init || {};
      newInit.mode = 'no-cors';
      
      if (typeof input === 'string') {
        newInput = input;
      } else if (input instanceof URL) {
        newInput = input.toString();
      } else {
        // Создаем новый Request с режимом no-cors
        newInput = new Request(url, {
          method: input.method,
          headers: input.headers,
          body: input.body,
          mode: 'no-cors',
          credentials: input.credentials,
          cache: input.cache,
          redirect: input.redirect,
          referrer: input.referrer,
          integrity: input.integrity
        });
      }
      
      return originalFetch(newInput, newInit);
    } else if (typeof input === 'string') {
      // Для обычных строковых URL используем трансформацию
      return originalFetch(transformURL(input), init);
    } else if (input instanceof URL) {
      // Для объектов URL также используем трансформацию
      const transformedUrl = transformURL(url);
      return originalFetch(new URL(transformedUrl), init);
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
  const mainScriptUrl = 'https://static.bro-js.ru/fiba/1.0.2/index.js';
  console.log('Pre-loading main script:', mainScriptUrl);
  
  // Создаем тег script напрямую
  const script = document.createElement('script');
  script.src = mainScriptUrl;
  script.async = true;
  script.defer = true;
  script.type = 'text/javascript';
  script.onerror = (err) => {
    console.error('Error loading script via DOM:', err);
    fetchAndEvalScript(mainScriptUrl)
      .catch(e => console.error('Failed to eval script:', e));
  };
  
  // Добавляем скрипт в head
  document.head.appendChild(script);
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
  
let rootElement: ReactDOM.Root;
  
export const mount = (Component: React.ComponentType<any>, element = document.getElementById('app')) => {
  if (!element) {
    console.error('Root element not found');
    return;
  }
  
  rootElement = ReactDOM.createRoot(element);
  rootElement.render(<Component/>);

  // Используем явное приведение типа для решения проблемы с module.hot
  // @ts-ignore - игнорируем проверку типов для module.hot
  if (module.hot) {
    // @ts-ignore - игнорируем проверку типов для module.hot.accept
    module.hot.accept('./app', () => {
      rootElement.render(<Component/>);
    });
  }
};

export const unmount = () => {
  if (rootElement) {
    rootElement.unmount();
  }
};
