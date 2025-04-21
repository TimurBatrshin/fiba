/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './app/styles/index.scss';
import App from './app';

// Расширяем интерфейс Module для поддержки webpack hot module replacement
declare global {
  interface Module {
    hot?: {
      accept(path: string, callback: () => void): void;
    };
  }
}
  
export default () => (
  <Provider store={store}>
    <App/>
  </Provider>
);
  
let mountElement: HTMLElement | null;
  
export const mount = (Component: React.ComponentType<any>, element = document.getElementById('app')) => {
  if (!element) {
    console.error('Root element not found');
    return;
  }
  
  mountElement = element;
  ReactDOM.render(
    <Provider store={store}>
      <Component/>
    </Provider>,
    element
  );

  // Используем явное приведение типа для решения проблемы с module.hot
  // @ts-ignore - игнорируем проверку типов для module.hot
  if (module.hot) {
    // @ts-ignore - игнорируем проверку типов для module.hot.accept
    module.hot.accept('./app', () => {
      ReactDOM.render(
        <Provider store={store}>
          <Component/>
        </Provider>,
        element
      );
    });
  }
};

export const unmount = () => {
  if (mountElement) {
    ReactDOM.unmountComponentAtNode(mountElement);
  }
};

// Проверяем и устанавливаем тему при загрузке приложения
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Render React 17 style (without createRoot)
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    rootElement
  );
}
