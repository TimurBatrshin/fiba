import axios from 'axios';
import { API_BASE_URL } from '../../config/envConfig';

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

    // Обрабатываем регистрации и добавляем информацию об игроках
    if (response.data.Registrations && Array.isArray(response.data.Registrations)) {
      result.Registrations = response.data.Registrations.map((reg: any) => {
        const registration = {
          id: reg.id,
          team_name: reg.team_name || reg.teamName || `Команда без названия`,
          status: reg.status || 'pending',
          tournament_id: reg.tournament_id || reg.tournamentId || id,
          user_id: reg.user_id || reg.userId || '',
          players: []
        };

        // Добавляем информацию о капитане как первом игроке
        if (reg.captain_id || reg.captainId) {
          registration.players.push({
            id: reg.captain_id || reg.captainId,
            name: reg.captain_name || 'Капитан',
            is_captain: true
          });
        }

        // Добавляем других игроков, если они есть
        if (reg.players && Array.isArray(reg.players)) {
          const players = reg.players.map((player: any) => ({
            id: player.id,
            name: player.name || 'Игрок',
            is_captain: player.is_captain || (reg.captain_id && player.id === reg.captain_id)
          }));
          
          // Объединяем игроков, избегая дублирования
          const existingPlayerIds = registration.players.map(p => p.id);
          const uniquePlayers = players.filter(p => !existingPlayerIds.includes(p.id));
          registration.players = [...registration.players, ...uniquePlayers];
        }

        return registration;
      });
    }

    return result;
  } catch (error) {
    console.error("Ошибка при получении данных о турнире:", error);
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
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/ads/public/advertisement`, {
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке рекламы:", error);
    // Возвращаем null, чтобы компоненты могли корректно обработать отсутствие рекламы
    return null;
  }
};

// Поиск игроков
export const searchPlayers = async (query: string): Promise<Player[]> => {
  try {
    const token = localStorage.getItem('token');
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
    return [];
  }
};

// Регистрация команды
export const registerTeam = async (tournamentId: string, teamName: string, playerIds: string[]) => {
  try {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    throw error;
  }
}; 