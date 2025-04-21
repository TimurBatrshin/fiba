/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import App from './app';
import { APP_SETTINGS } from './config/envConfig';
import { proxyService } from './api';

// Конфигурация для скриптов
const APP_CONFIG = {
  version: APP_SETTINGS.buildVersion,
  devURL: 'https://dev.bro-js.ru/fiba3x3/',
  staticURL: 'https://static.bro-js.ru/fiba3x3/',
  scripts: [
    // Отключаем загрузку скриптов, которые вызывают CORS-ошибки
    // `${APP_CONFIG.staticURL}${APP_SETTINGS.buildVersion}/index.js`,
  ],
  styles: [
    // Список стилей для загрузки (если требуется)
  ]
};

// Загрузка внешних скриптов стандартным способом через тег <script>
const loadExternalScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      
      // При ошибке пытаемся загрузить через режим no-cors напрямую
      console.log(`Пробуем загрузить через no-cors: ${url}`);
      fetch(url, { mode: 'no-cors', credentials: 'same-origin' })
        .then(() => {
          console.log(`Предварительный запрос с no-cors успешен: ${url}`);
          // Создаем новый элемент script с crossOrigin
          const scriptNoCorsFallback = document.createElement('script');
          scriptNoCorsFallback.src = url;
          scriptNoCorsFallback.crossOrigin = "anonymous";
          document.head.appendChild(scriptNoCorsFallback);
          
          scriptNoCorsFallback.onload = () => resolve();
          scriptNoCorsFallback.onerror = () => reject(new Error(`Не удалось загрузить скрипт даже с no-cors: ${url}`));
        })
        .catch(reject);
    };
    
    document.head.appendChild(script);
  });
};

// Загрузка всех необходимых скриптов
const loadAllScripts = async () => {
  try {
    // Загружаем скрипты параллельно
    await Promise.all(APP_CONFIG.scripts.map(url => loadExternalScript(url)));
    console.log('Все скрипты успешно загружены');
  } catch (error) {
    console.error('Ошибка при загрузке скриптов:', error);
  }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Загружаем все необходимые скрипты только если они есть
  if (APP_CONFIG.scripts.length > 0) {
    loadAllScripts();
  }
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
