// Добавляем расширения Jest для поддержки тестирования DOM
import '@testing-library/jest-dom';

// Полифилл для TextEncoder/TextDecoder, которые используются в MSW
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Полифилл для Response, Request и других Web API объектов
global.Response = require('node-fetch').Response;
global.Request = require('node-fetch').Request;
global.Headers = require('node-fetch').Headers;
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Настройка моков для fetch API
const originalFetch = global.fetch;

// Перед каждым тестом восстанавливаем оригинальный fetch
beforeEach(() => {
  global.fetch = originalFetch;
});

// Отключаем консольные предупреждения в тестах
// Это помогает сделать вывод тестов более чистым
let consoleSpy: any = { warn: null, error: null };

beforeAll(() => {
  consoleSpy.warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  consoleSpy.error = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (consoleSpy.warn) consoleSpy.warn.mockRestore();
  if (consoleSpy.error) consoleSpy.error.mockRestore();
});

// Мокаем объект localStorage для тестов
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Настройка для jest-fetch-mock
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();