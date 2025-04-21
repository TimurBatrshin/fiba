import api, { apiClient } from './client';
import tournamentsApi from './tournaments';
import usersApi from './users';

// Экспортируем все API через единую точку входа
export {
  api, // Базовый API-клиент
  apiClient, // Экземпляр axios для расширенных случаев
  tournamentsApi, // API для работы с турнирами
  usersApi, // API для работы с пользователями
};

// Единый объект для всех API
const apiService = {
  tournaments: tournamentsApi,
  users: usersApi,
  // Добавляйте новые API-модули здесь
};

export default apiService; 