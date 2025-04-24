import api from './client';
import { Tournament, Registration } from '../interfaces/Tournament';

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
  team_name: string;
  player_ids?: string[];
}

// Реэкспортируем интерфейсы из централизованного места
export type { Tournament, Registration };

// Сервис турниров
const TournamentService = {
  // Получить список всех турниров
  getAllTournaments: async (params?: { limit?: number; sort?: string; direction?: string; upcoming?: boolean }): Promise<Tournament[]> => {
    return api.get<Tournament[]>('/tournaments', { params });
  },
  
  // Получить турнир по ID
  getTournamentById: async (id: number): Promise<Tournament> => {
    return api.get<Tournament>(`/tournaments/${id}`);
  },
  
  // Получить турниры по статусу
  getTournamentsByStatus: async (status: string): Promise<Tournament[]> => {
    return api.get<Tournament[]>(`/tournaments/status/${status}`);
  },
  
  // Получить предстоящие турниры
  getUpcomingTournaments: async (): Promise<Tournament[]> => {
    return api.get<Tournament[]>(`/tournaments/upcoming`);
  },
  
  // Получить прошедшие турниры
  getPastTournaments: async (): Promise<Tournament[]> => {
    return api.get<Tournament[]>(`/tournaments/past`);
  },
  
  // Поиск турниров
  searchTournaments: async (query: string): Promise<Tournament[]> => {
    return api.get<Tournament[]>(`/tournaments/search`, { params: { query } });
  },
  
  // Создать турнир (только для администраторов)
  createTournament: async (data: CreateTournamentRequest): Promise<Tournament> => {
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('level', data.level);
    formData.append('prize_pool', String(data.prize_pool));
    
    if (data.tournament_image) {
      formData.append('tournament_image', data.tournament_image);
    }
    
    return api.post<Tournament>('/tournaments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Создать бизнес-турнир (для администраторов или бизнес-аккаунтов)
  createBusinessTournament: async (data: CreateBusinessTournamentRequest): Promise<Tournament> => {
    // Создаем FormData для отправки файлов
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('level', data.level);
    formData.append('prize_pool', String(data.prize_pool));
    
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
    
    return api.post<Tournament>('/tournaments/business', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Регистрация команды на турнир
  registerForTournament: async (tournamentId: number, teamName: string, playerIds?: string[]): Promise<Registration> => {
    // Создаем объект с необходимыми данными
    const requestData = {
      team_name: teamName,
      player_ids: playerIds
    };
    
    return api.post<Registration>(`/tournaments/${tournamentId}/register`, requestData);
  },
  
  // Обновить турнир (только для администраторов)
  updateTournament: async (id: number, data: Partial<Tournament>): Promise<Tournament> => {
    return api.put<Tournament>(`/tournaments/${id}`, data);
  },
  
  // Удалить турнир (только для администраторов)
  deleteTournament: async (id: number): Promise<void> => {
    return api.delete(`/tournaments/${id}`);
  },
  
  // Получение команд турнира по ID
  getTeamsForTournament: async (tournamentId: number): Promise<any[]> => {
    try {
      const response = await api.get<any[]>(`/tournaments/${tournamentId}/teams`);
      return response || [];
    } catch (error) {
      console.error(`Error fetching teams for tournament ${tournamentId}:`, error);
      return [];
    }
  }
};

export default TournamentService; 