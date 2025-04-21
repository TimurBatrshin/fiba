// Entry point for the application
import { mount } from './src/index.tsx';
import App from './src/app';

// Mount the application
mount(App);

// For hot module replacement
if (module.hot) {
  module.hot.accept();
} 