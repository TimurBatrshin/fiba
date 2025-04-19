// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Игнорируем нежелательные ошибки, которые могут возникать в тестах
Cypress.on('uncaught:exception', (err, runnable) => {
  // Возвращаем false, чтобы Cypress не падал при необработанных ошибках
  return false;
});

// Добавляем настройки для скриншотов и видео
Cypress.Screenshot.defaults({
  capture: 'viewport', // Захватываем только видимый экран, а не весь документ
});

// Отключаем scroll анимацию для стабильности тестов
Cypress.on('scrolled', $el => {
  $el.get(0).scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'instant',
  });
}); 