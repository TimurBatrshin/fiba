// Entry point for the application
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './src/store';
import App from './src/app';

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