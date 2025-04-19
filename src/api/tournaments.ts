import api from './client';

// Типы данных для турниров
export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  description?: string;
  imageUrl?: string;
}

export interface TournamentFilters {
  status?: 'upcoming' | 'ongoing' | 'completed';
  search?: string;
  startDate?: string;
  endDate?: string;
}

// API-функции для работы с турнирами
export const tournamentsApi = {
  // Получение списка всех турниров с возможностью фильтрации
  getAll: async (filters?: TournamentFilters): Promise<Tournament[]> => {
    return api.get('/tournaments', { params: filters });
  },

  // Получение турнира по ID
  getById: async (id: string): Promise<Tournament> => {
    return api.get(`/tournaments/${id}`);
  },

  // Создание нового турнира
  create: async (tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> => {
    return api.post('/tournaments', tournamentData);
  },

  // Обновление существующего турнира
  update: async (id: string, tournamentData: Partial<Tournament>): Promise<Tournament> => {
    return api.put(`/tournaments/${id}`, tournamentData);
  },

  // Удаление турнира
  delete: async (id: string): Promise<void> => {
    return api.delete(`/tournaments/${id}`);
  },

  // Получение участников турнира
  getParticipants: async (tournamentId: string): Promise<any[]> => {
    return api.get(`/tournaments/${tournamentId}/participants`);
  },

  // Добавление участника в турнир
  addParticipant: async (tournamentId: string, participantData: any): Promise<any> => {
    return api.post(`/tournaments/${tournamentId}/participants`, participantData);
  },

  // Удаление участника из турнира
  removeParticipant: async (tournamentId: string, participantId: string): Promise<void> => {
    return api.delete(`/tournaments/${tournamentId}/participants/${participantId}`);
  }
};

export default tournamentsApi; 