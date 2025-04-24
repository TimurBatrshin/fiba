// Entry point for the application
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './src/store';
import App from './src/app';

// Очищаем localStorage при каждом запуске приложения для гарантированного сброса авторизации
console.log('Clearing localStorage for fresh authentication...');

// Очищаем только токены авторизации
const keysToRemove = [
  'auth_token', 'refresh_token'
];

keysToRemove.forEach(key => localStorage.removeItem(key));

// Рендерим приложение напрямую
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

// For hot module replacement
if (module.hot) {
  module.hot.accept('./src/app', () => {
    const NextApp = require('./src/app').default;
    ReactDOM.render(
      <Provider store={store}>
        <NextApp />
      </Provider>,
      document.getElementById('app')
    );
  });
} 