/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import App from './app';
import { APP_SETTINGS } from './config/envConfig';

// Конфигурация приложения
const APP_CONFIG = {
  version: APP_SETTINGS.buildVersion,
  devURL: 'https://dev.bro-js.ru/fiba/',
  staticURL: 'https://timurbatrshin-fiba-backend-e561.twc1.net/api/proxy/static-bro-js/fiba/',
  scripts: [],
  styles: []
};

// Загрузка внешних скриптов
const loadExternalScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }
    
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
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

// Загрузка всех необходимых скриптов
const loadAllScripts = async () => {
  try {
    await Promise.all(APP_CONFIG.scripts.map(url => loadExternalScript(url)));
    console.log('All scripts loaded successfully');
  } catch (error) {
    console.error('Error loading scripts:', error);
  }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  if (APP_CONFIG.scripts.length > 0) {
    loadAllScripts();
  }
});

// Расширяем интерфейс Module для поддержки webpack hot module replacement
declare global {
  interface NodeModule {
    hot?: {
      accept(path?: string, callback?: () => void): void;
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

  // Поддержка hot module replacement
  // @ts-ignore - Используем для обеспечения совместимости с Webpack HMR
  if (module.hot) {
    // @ts-ignore - Используем для обеспечения совместимости с Webpack HMR
    module.hot.accept('./app', () => {
      const NextApp = require('./app').default;
      ReactDOM.render(<NextApp/>, element);
    });
  }
};

export const unmount = () => {
  if (rootElement) {
    ReactDOM.unmountComponentAtNode(rootElement);
    rootElement = null;
  }
};
