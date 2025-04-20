/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import './app/styles/index.scss';
import App from './app';
import { APP_SETTINGS } from './config/envConfig';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Создаем основной компонент приложения
// Этот подход похож на тот, что используется в ProjectX
const AppRoot: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  );
};

// Расширяем интерфейс Module для поддержки webpack hot module replacement
declare global {
  interface Module {
    hot?: {
      accept(path: string, callback: () => void): void;
    };
  }
}
  
export default () => <AppRoot />;
  
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

// Инициализируем приложение
document.addEventListener('DOMContentLoaded', () => {
  mount(AppRoot);
  
  // Внешние скрипты загружаем через отдельные функции после инициализации приложения
  // Это предотвращает блокировку рендеринга и проблемы с CORS
  const loadExternalScripts = () => {
    // Динамическая загрузка скриптов через создание элементов script
    // Это снижает риск CORS-ошибок
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log(`Скрипт успешно загружен: ${src}`);
          resolve();
        };
        
        script.onerror = (error) => {
          console.error(`Ошибка загрузки скрипта: ${src}`, error);
          // Не вызываем reject, чтобы не останавливать загрузку других скриптов
          resolve();
        };
        
        document.body.appendChild(script);
      });
    };
    
    // Загружаем скрипты последовательно, чтобы гарантировать правильный порядок
    const scripts = [
      `https://static.bro-js.ru/fiba3x3/${APP_SETTINGS.buildVersion}/index.js`,
      'https://dev.bro-js.ru/fire.app/1.6.3/index.js'
    ];
    
    scripts.reduce((chain, script) => 
      chain.then(() => loadScript(script)), Promise.resolve());
  };
  
  // Запускаем загрузку скриптов после небольшой задержки,
  // чтобы приложение успело полностью загрузиться
  setTimeout(loadExternalScripts, 1000);
});
