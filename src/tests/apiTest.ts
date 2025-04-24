import axios from 'axios';
import { APP_SETTINGS } from '../config/envConfig';

// Функция для проверки соединения с API
export async function testApiConnection() {
  console.log('Тестирование соединения с API...');
  console.log(`API URL: ${APP_SETTINGS.apiBaseUrl}`);
  
  try {
    const response = await axios.get(`${APP_SETTINGS.apiBaseUrl}/auth/test`, {
      timeout: 5000,
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:', response.data);
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error: any) {
    console.error('Ошибка при тестировании API:', error);
    
    return {
      success: false,
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : undefined
    };
  }
}

// Функция для тестирования аутентификации
export async function testAuthentication(email: string, password: string) {
  console.log('Тестирование аутентификации...');
  console.log(`Email: ${email}`);
  
  try {
    const response = await axios.post(`${APP_SETTINGS.apiBaseUrl}/auth/login`, {
      email,
      password
    }, {
      timeout: 5000,
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Токен получен:', !!response.data.token);
    
    return {
      success: true,
      status: response.status,
      token: response.data.token,
      userId: response.data.userId,
      email: response.data.email,
      name: response.data.name,
      role: response.data.role
    };
  } catch (error: any) {
    console.error('Ошибка при тестировании аутентификации:', error);
    
    return {
      success: false,
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : undefined
    };
  }
}

// Функция для тестирования получения турниров
export async function testGetTournaments() {
  console.log('Тестирование получения турниров...');
  
  try {
    const response = await axios.get(`${APP_SETTINGS.apiBaseUrl}/tournaments`, {
      timeout: 5000,
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Получено турниров:', response.data.length);
    
    return {
      success: true,
      status: response.status,
      tournaments: response.data
    };
  } catch (error: any) {
    console.error('Ошибка при получении турниров:', error);
    
    return {
      success: false,
      error: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : undefined
    };
  }
}

// Запуск всех тестов
export async function runAllTests() {
  console.log('=== Запуск тестов API ===');
  
  const connectionResult = await testApiConnection();
  console.log('\nРезультат теста соединения:', connectionResult.success ? 'УСПЕХ' : 'ОШИБКА');
  
  if (connectionResult.success) {
    const authResult = await testAuthentication('Timur007@example.com', 'qwerty123');
    console.log('\nРезультат теста аутентификации:', authResult.success ? 'УСПЕХ' : 'ОШИБКА');
    
    if (authResult.success && authResult.token) {
      // Устанавливаем токен для авторизованных запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${authResult.token}`;
      
      const tournamentsResult = await testGetTournaments();
      console.log('\nРезультат теста получения турниров:', tournamentsResult.success ? 'УСПЕХ' : 'ОШИБКА');
    }
  }
  
  console.log('\n=== Тесты завершены ===');
}

// Экспорт для использования в браузере
(window as any).testApi = {
  testConnection: testApiConnection,
  testAuth: testAuthentication,
  testTournaments: testGetTournaments,
  runAll: runAllTests
}; 