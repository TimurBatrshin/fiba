import api, { apiClient } from './client';
import tournamentsApi from './tournaments';
import usersApi from './users';
import proxyService from './proxy';

// Экспортируем все API через единую точку входа
export {
  api, // Базовый API-клиент
  apiClient, // Экземпляр axios для расширенных случаев
  tournamentsApi, // API для работы с турнирами
  usersApi, // API для работы с пользователями
  proxyService, // Сервис для прокси-запросов к внешним ресурсам
};

// Единый объект для всех API
const apiService = {
  tournaments: tournamentsApi,
  users: usersApi,
  proxy: proxyService,
  // Добавляйте новые API-модули здесь
};

export default apiService; 