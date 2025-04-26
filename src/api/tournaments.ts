import api from './client';
import { Tournament, Registration } from '../interfaces/Tournament';
import { APP_SETTINGS } from '../config/envConfig';
import { getStoredToken, removeStoredToken } from '../utils/tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '../interfaces/Auth';

// Интерфейсы для запросов
export interface CreateTournamentRequest {
  title: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  tournament_image?: File;
}

export interface CreateBusinessTournamentRequest extends CreateTournamentRequest {
  sponsor_name?: string;
  business_type?: string;
  sponsor_logo?: File;
}

export interface TournamentRegistrationRequest {
  tournamentId: number;
  teamName: string;
  playerIds?: string[];
}

// Реэкспортируем интерфейсы из централизованного места
export type { Tournament, Registration };

// Сервис турниров
const TournamentService = {
  // Получить список всех турниров
  getAllTournaments: async (params?: { 
    limit?: number; 
    offset?: number;
    sort?: string; 
    direction?: string; 
    status?: string;
    search?: string;
  }): Promise<{ tournaments: Tournament[]; total: number }> => {
    const response = await api.get('/tournaments', { params });
    return response.data;
  },
  
  // Получить турнир по ID
  getTournamentById: async (id: number): Promise<Tournament> => {
    const response = await api.get<Tournament>(`/tournaments/${id}`);
    return response.data;
  },
  
  // Получить турниры по статусу
  getTournamentsByStatus: async (status: string): Promise<Tournament[]> => {
    const response = await api.get<Tournament[]>(`/tournaments/status/${status}`);
    return response.data;
  },
  
  // Получить предстоящие турниры
  getUpcomingTournaments: async (): Promise<Tournament[]> => {
    const response = await api.get<Tournament[]>(`/tournaments/upcoming`);
    return response.data;
  },
  
  // Получить прошедшие турниры
  getPastTournaments: async (): Promise<Tournament[]> => {
    const response = await api.get<Tournament[]>(`/tournaments/past`);
    return response.data;
  },
  
  // Поиск турниров
  searchTournaments: async (query: string): Promise<Tournament[]> => {
    const response = await api.get<Tournament[]>(`/tournaments/search`, { params: { query } });
    return response.data;
  },
  
  // Создать новый турнир
  createTournament: async (data: CreateTournamentRequest): Promise<Tournament> => {
    const formData = new FormData();
    
    // Добавляем обязательные поля
    formData.append('title', data.title);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('level', data.level);
    formData.append('prize_pool', String(data.prize_pool));
    
    // Добавляем опциональное изображение
    if (data.tournament_image) {
      formData.append('tournament_image', data.tournament_image);
    }
    
    console.log('Отправка данных турнира:', {
      title: data.title,
      date: data.date,
      location: data.location,
      level: data.level,
      prize_pool: data.prize_pool,
      hasImage: !!data.tournament_image
    });

    const response = await api.post('/tournaments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Создать бизнес-турнир (для администраторов или бизнес-аккаунтов)
  createBusinessTournament: async (data: CreateBusinessTournamentRequest): Promise<Tournament> => {
    const formData = new FormData();
    
    // Добавляем обязательные поля
    formData.append('title', data.title);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('level', data.level);
    formData.append('prize_pool', String(data.prize_pool));
    
    // Добавляем опциональные поля бизнес-турнира
    if (data.sponsor_name) {
      formData.append('sponsor_name', data.sponsor_name);
    }
    
    if (data.business_type) {
      formData.append('business_type', data.business_type);
    }
    
    if (data.tournament_image) {
      formData.append('tournament_image', data.tournament_image);
    }
    
    if (data.sponsor_logo) {
      formData.append('sponsor_logo', data.sponsor_logo);
    }
    
    console.log('Отправка данных бизнес-турнира:', {
      title: data.title,
      date: data.date,
      location: data.location,
      level: data.level,
      prize_pool: data.prize_pool,
      sponsor_name: data.sponsor_name,
      business_type: data.business_type,
      hasTournamentImage: !!data.tournament_image,
      hasSponsorLogo: !!data.sponsor_logo
    });

    const response = await api.post('/tournaments/business', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Регистрация команды на турнир
  registerForTournament: async (tournamentId: number, teamName: string, playerIds?: string[]): Promise<Registration> => {
    const token = getStoredToken();
    
    if (!token) {
      throw new Error('Для регистрации команды необходимо авторизоваться');
    }

    try {
      // Декодируем токен для получения ID пользователя
      const decoded = jwtDecode<DecodedToken>(token);
      const userId = decoded.sub;
      const currentTime = Date.now() / 1000;

      if (!userId) {
        removeStoredToken();
        throw new Error('Не удалось определить ID пользователя. Пожалуйста, войдите заново.');
      }

      // Проверяем срок действия токена
      if (decoded.exp && decoded.exp <= currentTime) {
        removeStoredToken();
        throw new Error('Срок действия токена истек. Пожалуйста, войдите заново.');
      }

      // Создаем объект с данными для регистрации
      const requestData: TournamentRegistrationRequest = {
        tournamentId,
        teamName: teamName.trim(),
        playerIds: playerIds || []
      };
      
      console.log('Отправка запроса на регистрацию команды:', {
        tournamentId,
        teamName: requestData.teamName,
        playerIds: requestData.playerIds,
        token: token.substring(0, 10) + '...'  // Логируем только начало токена для безопасности
      });

      // Добавляем явные заголовки для запроса
      const response = await api.post<Registration>(
        `/tournaments/${tournamentId}/register`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.data) {
        throw new Error('Не удалось получить ответ от сервера');
      }

      return response.data;
    } catch (error: any) {
      // Улучшенная обработка ошибок
      if (error.response?.status === 401) {
        console.error('Ошибка авторизации при регистрации:', error);
        throw new Error('Ошибка авторизации. Пожалуйста, войдите заново.');
      }
      
      if (error.response?.status === 400) {
        console.error('Ошибка валидации данных:', error.response.data);
        throw new Error(error.response.data.message || 'Проверьте правильность введенных данных');
      }

      if (error.response?.status === 403) {
        console.error('Отказано в доступе:', error);
        throw new Error('У вас нет прав для выполнения этого действия');
      }

      console.error('Ошибка при регистрации команды:', error);
      throw new Error(error.message || 'Произошла ошибка при регистрации команды');
    }
  },
  
  // Обновить турнир (только для администраторов)
  updateTournament: async (id: number, data: Partial<Tournament>): Promise<Tournament> => {
    const response = await api.put<Tournament>(`/tournaments/${id}`, data);
    return response.data;
  },
  
  // Удалить турнир (только для администраторов)
  deleteTournament: async (id: number): Promise<void> => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },
  
  // Получить список команд турнира
  getTournamentTeams: async (id: number): Promise<Registration[]> => {
    const response = await api.get(`/tournaments/${id}/teams`);
    return response.data;
  },
  
  // Получить статистику турнира
  getTournamentStats: async (id: number): Promise<any> => {
    const response = await api.get(`/tournaments/${id}/stats`);
    return response.data;
  }
};

export default TournamentService;