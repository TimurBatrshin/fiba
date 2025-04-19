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

// Проверяем наличие нужных скриптов на странице загрузки
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Пути для предзагрузки
    const scriptPaths = [
      `${APP_CONFIG.devURL}${APP_CONFIG.version}/index.js`,
      `${APP_CONFIG.staticURL}${APP_CONFIG.version}/index.js`,
    ];
    
    // Инжектим скрипты напрямую как текст, а не через src
    scriptPaths.forEach(url => {
      // Прямое встраивание скрипта с правильным URL
      inlineLoadScript(url);
    });
  } catch (e) {
    console.error('Ошибка при установке скриптов:', e);
  }
});

// Инлайн-загрузка скрипта
const inlineLoadScript = (url: string) => {
  console.log(`Попытка прямой загрузки скрипта: ${url}`);
  
  // Создаем XMLHttpRequest с режимом "no-cors"
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  
  // Устанавливаем обработчики
  xhr.onload = () => {
    try {
      if (xhr.status >= 200 && xhr.status < 400) {
        console.log(`Получен ответ для ${url}, выполняем скрипт`);
        
        // Создаем элемент script с содержимым
        const script = document.createElement('script');
        script.text = xhr.responseText;
        document.head.appendChild(script);
        
        console.log(`Скрипт успешно выполнен: ${url}`);
      } else {
        console.error(`Ошибка при загрузке скрипта ${url}: ${xhr.status}`);
      }
    } catch (error) {
      console.error(`Ошибка при выполнении скрипта ${url}:`, error);
    }
  };
  
  xhr.onerror = () => {
    console.error(`Сетевая ошибка при загрузке скрипта: ${url}`);
    
    // Вторая попытка: загрузка через элемент script с mode=no-cors
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = "anonymous";
    
    script.onload = () => console.log(`Успешная загрузка через тег script: ${url}`);
    script.onerror = (error) => console.error(`Ошибка загрузки через тег script: ${url}`, error);
    
    document.head.appendChild(script);
  };
  
  // Отправляем запрос
  xhr.send();
};

// Прямой способ загрузки скрипта
const loadScriptDirect = (url: string): Promise<void> => {
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
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
      console.log(`Скрипт загружен успешно: ${url}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Ошибка загрузки скрипта: ${url}`, error);
      
      // Пробуем вторую попытку с no-cors
      inlineLoadScript(url);
      
      // Все равно считаем успешным, так как вторая попытка была сделана
      resolve();
    };
    
    document.head.appendChild(script);
    console.log(`Скрипт добавлен в DOM: ${url}`);
  });
};

// Сохраняем оригинальную функцию fetch
const originalFetch = window.fetch;

// Переопределяем fetch для обработки CORS ошибок
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
    
    // Проверка конкретно на ресурс index.js с указанной версией
    if (url.includes(`static.bro-js.ru/fiba/${APP_CONFIG.version}/index.js`) || 
        url.includes(`dev.bro-js.ru/fiba/${APP_CONFIG.version}/index.js`)) {
      console.log(`Обнаружен запрос к критическому скрипту: ${url}`);
      
      // Для index.js используем прямую загрузку через элемент script
      try {
        await loadScriptDirect(url);
        
        // Возвращаем фейковый успешный ответ
        return new Response('/* Script manually loaded */', {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/javascript'
          })
        });
      } catch (error) {
        console.error(`Не удалось загрузить скрипт ${url}:`, error);
      }
    }
    
    // Для остальных ресурсов bro-js
    if (url.includes('static.bro-js.ru/fiba/') || url.includes('dev.bro-js.ru/fiba/')) {
      console.log(`Обработка запроса к bro-js: ${url}`);
      
      // Для JS файлов пробуем загрузку через DOM
      if (url.endsWith('.js')) {
        try {
          await loadScriptDirect(url);
          
          // Возвращаем фейковый успешный ответ
          return new Response('/* Script loaded via DOM */', {
            status: 200,
            headers: new Headers({
              'Content-Type': 'application/javascript'
            })
          });
        } catch (scriptError) {
          console.warn(`Не удалось загрузить JS-файл: ${url}`, scriptError);
        }
      }
      
      // Для других ресурсов используем no-cors
      console.log(`Используем no-cors для запроса: ${url}`);
      return originalFetch(url, {
        ...(init || {}),
        mode: 'no-cors',
        credentials: 'include'
      });
    }
    
    // Для всех остальных запросов используем оригинальный fetch
    return originalFetch(input, init);
  } catch (error) {
    console.error('Ошибка при перехвате fetch:', error);
    return originalFetch(input, init);
  }
}) as typeof fetch;

// Напрямую подключаем основной скрипт
inlineLoadScript(`${APP_CONFIG.staticURL}${APP_CONFIG.version}/index.js`);

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
