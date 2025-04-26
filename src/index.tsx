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
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { NotificationProvider } from './contexts/NotificationContext';
import { BASE_PATH } from './config/envConfig';

// Глобальный обработчик непойманных ошибок в промисах
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Очищаем только токены авторизации при запуске в режиме разработки
if (process.env.NODE_ENV === 'development') {
  console.log('Clearing localStorage for fresh authentication...');
  const keysToRemove = [
    'auth_token', 'refresh_token'
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Конфигурация приложения
const APP_CONFIG = {
  version: APP_SETTINGS.buildVersion,
  devURL: 'https://dev.bro-js.ru/fiba/',
  staticURL: 'https://timurbatrshin-fiba-backend-fc1f.twc1.net/api/proxy/static-bro-js/fiba/'
};

const root = document.getElementById('root');

if (root) {
  ReactDOM.render(
    <React.StrictMode>
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
    </React.StrictMode>,
    root
  );
}

// Поддержка hot module replacement
if (module.hot) {
  module.hot.accept('./app', () => {
    const NextApp = require('./app').default;
    if (root) {
      ReactDOM.render(
        <React.StrictMode>
          <Provider store={store}>
            <BrowserRouter basename={BASE_PATH}>
              <ConfigProvider locale={zhCN}>
                <NotificationProvider>
                  <AuthProvider>
                    <NextApp />
                  </AuthProvider>
                </NotificationProvider>
              </ConfigProvider>
            </BrowserRouter>
          </Provider>
        </React.StrictMode>,
        root
      );
    }
  });
}
