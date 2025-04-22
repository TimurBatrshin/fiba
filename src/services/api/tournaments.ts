import axios from 'axios';
import { API_BASE_URL } from '../../config/envConfig';
import { AuthService } from '../AuthService';

// Типы данных
export interface TournamentData {
  id: string;
  name?: string;
  title?: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  status: 'registration' | 'in_progress' | 'completed';
  description?: string;
  Registrations?: any[];
  // Бизнес-поля
  sponsor_name?: string;
  sponsor_logo?: string;
  business_type?: string;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
}

// Получение турнира по ID
export const getTournamentById = async (id: string): Promise<TournamentData> => {
  try {
    // Не требуем авторизации для получения данных о турнире
    const response = await axios.get(`${API_BASE_URL}/tournaments/${id}`);
    
    if (!response.data) {
      throw new Error("Данные о турнире не получены от сервера");
    }

    console.log("Ответ API для турнира:", response.data);

    // Нормализуем данные турнира
    const result = {
      id: response.data.id || id || '',
      name: response.data.name || response.data.title || 'Турнир без названия',
      title: response.data.title || response.data.name || 'Турнир без названия',
      date: response.data.date || new Date().toISOString(),
      location: response.data.location || 'Не указано',
      level: response.data.level || 'Любительский',
      prize_pool: response.data.prize_pool || 0,
      status: response.data.status || 'registration',
      description: response.data.description || 'Описание отсутствует',
      Registrations: [],
      sponsor_name: response.data.sponsor_name || '',
      sponsor_logo: response.data.sponsor_logo || '',
      business_type: response.data.business_type || ''
    };

    // Если в ответе есть данные о регистрациях - копируем их
    if (response.data.Registrations) {
      result.Registrations = response.data.Registrations;
    }

    return result;
  } catch (error: any) {
    console.error("Ошибка при получении данных турнира:", error);
    throw error;
  }
};

// Создание бизнес-турнира
export const createBusinessTournament = async (tournamentData: {
  title: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  sponsor_name: string;
  sponsor_logo: string;
  business_type: string;
}): Promise<TournamentData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Необходима авторизация');
    }

    const response = await axios.post(
      `${API_BASE_URL}/tournaments/business`, 
      tournamentData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Ошибка при создании бизнес-турнира:', error);
    throw error;
  }
};

// Получение рекламы
export const getAdvertisement = async () => {
  try {
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/ads/public/advertisement`, {
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке рекламы:", error);
    
    if (error.response && error.response.status === 401 && AuthService.getInstance().isAuthenticated()) {
      // If token expired or invalid and we thought we were authenticated, logout
      AuthService.getInstance().logout();
    }
    
    // Возвращаем null, чтобы компоненты могли корректно обработать отсутствие рекламы
    return null;
  }
};

// Поиск игроков
export const searchPlayers = async (query: string): Promise<Player[]> => {
  try {
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
      headers
    });
    
    // Преобразуем ответ от сервера в формат, который ожидает фронтенд
    return response.data.map((user: any) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl || null
    }));
  } catch (error) {
    console.error("Ошибка при поиске игроков:", error);
    
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, redirect to login
      AuthService.getInstance().logout();
    }
    
    return [];
  }
};

// Регистрация команды
export const registerTeam = async (tournamentId: string, teamName: string, playerIds: string[]) => {
  try {
    const authService = AuthService.getInstance();
    if (!authService.isAuthenticated()) {
      console.error("Ошибка регистрации: пользователь не авторизован");
      throw new Error('Необходима авторизация');
    }

    const token = authService.getToken();
    if (!token) {
      console.error("Ошибка регистрации: отсутствует токен авторизации");
      throw new Error('Необходима авторизация');
    }

    console.log(`Попытка регистрации команды "${teamName}" на турнир ${tournamentId} с ${playerIds.length} игроками`);
    
    const requestData = {
      teamName,
      playerIds
    };
    
    console.log("Данные запроса:", requestData);
    console.log("URL запроса:", `${API_BASE_URL}/tournaments/${tournamentId}/register`);
    
    const response = await axios.post(
      `${API_BASE_URL}/tournaments/${tournamentId}/register`, 
      requestData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Успешный ответ сервера:", response.status, response.data);
    return response;
  } catch (error) {
    console.error("Ошибка при регистрации команды:", error);
    
    // Логируем детали ошибки
    if (error.response) {
      // Ответ сервера с ошибкой
      console.error("Статус ошибки:", error.response.status);
      console.error("Данные ошибки:", error.response.data);
      console.error("Заголовки:", error.response.headers);
      
      // If unauthorized, redirect to login
      if (error.response.status === 401) {
        AuthService.getInstance().logout();
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error("Запрос отправлен, но ответ не получен:", error.request);
    } else {
      // Ошибка в настройке запроса
      console.error("Ошибка в запросе:", error.message);
    }
    
    throw error;
  }
};

// Обновление результатов матча
export const updateMatchScore = async (tournamentId: string, matchId: string, score1: number, score2: number, isCompleted: boolean = true) => {
  try {
    const authService = AuthService.getInstance();
    if (!authService.isAuthenticated()) {
      throw new Error('Необходима авторизация');
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error('Необходима авторизация');
    }

    const response = await axios.put(
      `${API_BASE_URL}/tournaments/${tournamentId}/matches/${matchId}`, 
      { score1, score2, isCompleted }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении результатов матча:", error);
    
    if (error.response && error.response.status === 401) {
      AuthService.getInstance().logout();
    }
    
    throw error;
  }
}; 