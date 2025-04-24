/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './styles/index.scss';
import App from './app';
import { APP_SETTINGS } from './config/envConfig';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
// @ts-ignore
import { ConfigProvider } from 'antd';
// @ts-ignore
import zhCN from 'antd/locale/zh_CN';
// @ts-ignore
import { NotificationProvider } from './contexts/NotificationContext';
import { APP_BASE_URL, BASE_PATH } from './config/envConfig';
// @ts-ignore
import { BASE_ROUTE } from './config/routes';

// Глобальный обработчик непойманных ошибок в промисах
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Очищаем localStorage при каждом запуске приложения для гарантированного сброса авторизации
console.log('Clearing localStorage for fresh authentication...');

// Очищаем только токены авторизации
const keysToRemove = [
  'auth_token', 'refresh_token'
];

keysToRemove.forEach(key => localStorage.removeItem(key));

// Конфигурация приложения
const APP_CONFIG = {
  version: APP_SETTINGS.buildVersion,
  devURL: 'https://dev.bro-js.ru/fiba/',
  staticURL: 'https://timurbatrshin-fiba-backend-fc1f.twc1.net/api/proxy/static-bro-js/fiba/',
  scripts: [], // Временно отключаем внешние скрипты
  styles: []
};

// Загрузка внешних скриптов
const loadExternalScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }
    
    try {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";
      
      script.onload = () => {
        console.log(`Script loaded successfully: ${url}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`Script loading error: ${url}`, error);
        console.warn(`Script not loaded, but application will continue: ${url}`);
        resolve(); // Важно: всегда разрешаем промис, чтобы не блокировать цепочку
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in loadExternalScript:', error);
      resolve(); // Разрешаем промис даже при ошибке
    }
  });
};

// Загрузка всех необходимых скриптов
const loadAllScripts = async () => {
  try {
    if (APP_CONFIG.scripts.length === 0) {
      return; // Если нет скриптов, выходим
    }
    
    await Promise.all(APP_CONFIG.scripts.map(url => loadExternalScript(url)));
    console.log('All scripts loaded successfully');
  } catch (error) {
    console.error('Error loading scripts:', error);
  }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Отключаем временно загрузку внешних скриптов
  // if (APP_CONFIG.scripts.length > 0) {
  //   loadAllScripts();
  // }
  
  // Отключаем регистрацию Service Worker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/sw.js')
  //     .then(registration => {
  //       console.log('ServiceWorker registration successful with scope: ', registration.scope);
  //     })
  //     .catch(error => {
  //       console.error('ServiceWorker registration failed: ', error);
  //     });
  // }
});

// Расширяем интерфейс Module для поддержки webpack hot module replacement
declare global {
  interface NodeModule {
    hot?: {
      accept(path?: string, callback?: () => void): void;
      accept(): void;
    };
  }
}
  
export default () => (
  <Provider store={store}>
    <BrowserRouter basename={BASE_PATH}>
      <ConfigProvider locale={zhCN}>
        <NotificationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotificationProvider>
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
);
  
// Храним ссылку на DOM-элемент для размонтирования
let rootElement: HTMLElement | null = null;
  
export const mount = (Component: React.ComponentType<any>, element = document.getElementById('app')) => {
  try {
    if (!element) {
      console.error('Root element not found');
      return;
    }
    
    rootElement = element;
    
    // Используем ReactDOM.render для React 17
    ReactDOM.render(
      <Provider store={store}>
        <Component/>
      </Provider>,
      element
    );

    // Поддержка hot module replacement
    // @ts-ignore: module.hot существует в webpack, но TypeScript не распознает его по умолчанию
    if (module.hot) {
      try {
        // @ts-ignore: module.hot существует в webpack, но TypeScript не распознает его по умолчанию
        module.hot.accept('./app', () => {
          try {
            const NextApp = require('./app').default;
            
            ReactDOM.render(
              <Provider store={store}>
                <NextApp/>
              </Provider>,
              element
            );
          } catch (error) {
            console.error('Error in HMR render:', error);
          }
        });
      } catch (hmrError) {
        console.error('HMR configuration error:', hmrError);
      }
    }
  } catch (mountError) {
    console.error('Error in mount function:', mountError);
  }
};

export const unmount = () => {
  try {
    if (rootElement) {
      ReactDOM.unmountComponentAtNode(rootElement);
      rootElement = null;
    }
  } catch (unmountError) {
    console.error('Error in unmount function:', unmountError);
  }
};
