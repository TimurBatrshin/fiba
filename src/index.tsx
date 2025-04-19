/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';
import ReactDOM from 'react-dom/client';
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
