// Конфигурация CORS для различных окружений
export const CORS_CONFIG = {
  development: {
    credentials: true,
    allowedOrigins: ['http://localhost:8099', 'https://dev.bro-js.ru', 'https://static.bro-js.ru'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  production: {
    credentials: true,
    allowedOrigins: ['https://dev.bro-js.ru', 'https://static.bro-js.ru', 'https://bro-js.ru'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

// Функция для настройки fetch с учетом CORS политики
export const fetchWithCORS = (url: string, options: RequestInit = {}): Promise<Response> => {
  // Создаем новый объект настроек с CORS
  const corsOptions: RequestInit = {
    ...options,
    mode: 'cors',
    credentials: 'include',
    headers: {
      ...options.headers,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  
  return fetch(url, corsOptions);
}; 