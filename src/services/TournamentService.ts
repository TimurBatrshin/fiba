import { Tournament, TournamentLevel, TournamentStatus } from '../interfaces/Tournament';
import { API_CONFIG } from '../config/api';
import { jwtDecode } from 'jwt-decode';
import { getStoredToken, setStoredToken } from '../utils/tokenStorage';
import { DecodedToken } from '../types/auth';
import { BaseApiService } from './BaseApiService';
import { TournamentResponse } from '../types/tournament';
import { authService } from './auth.service';

export interface TournamentFilter {
  status?: TournamentStatus;
  location?: string;
  startDate?: string;
  endDate?: string;
  level?: TournamentLevel;
  search?: string;
}

interface TeamRegistrationData {
  teamName: string;
  playerIds?: string[];
  teamLogo?: File;
}

export class TournamentService extends BaseApiService {
  constructor() {
    super();
  }

  /**
   * Get all tournaments
   */
  public async getAllTournaments(): Promise<Tournament[]> {
    try {
      const response = await this.get<Tournament[]>('/tournaments');
      // Проверка и гарантия того, что возвращается массив
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching all tournaments:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Get tournaments filtered by criteria
   */
  public async getTournaments(filter: TournamentFilter): Promise<Tournament[]> {
    try {
      const response = await this.get<Tournament[]>('/tournaments', filter);
      // Проверка и гарантия того, что возвращается массив
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching filtered tournaments:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Get tournament by ID
   */
  public async getTournamentById(id: string): Promise<Tournament | null> {
    try {
      console.log(`TournamentService.getTournamentById(${id}) - начало запроса`);
      const response = await this.get<Tournament>(`/${id}`);
      
      if (!response || !response.data) {
        console.warn(`TournamentService.getTournamentById(${id}) - получены пустые данные`);
        return null;
      }
      
      console.log(`TournamentService.getTournamentById(${id}) - получен ответ:`, response.data);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching tournament with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Get upcoming tournaments
   */
  public async getUpcomingTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'UPCOMING' };
    if (limit) {
      params.limit = limit;
    }
    
    console.log(`TournamentService.getUpcomingTournaments() - начало запроса с параметрами:`, params);
    
    try {
      const response = await this.get<Tournament[]>('/tournaments', params);
      
      // Проверка на null/undefined
      if (!response || !response.data) {
        console.warn('TournamentService.getUpcomingTournaments() - получены пустые данные');
        return [];
      }
      
      // Проверка и гарантия того, что возвращается массив
      if (!Array.isArray(response.data)) {
        console.error('TournamentService.getUpcomingTournaments() - ожидался массив, получено:', 
          typeof response.data, response.data);
        return [];
      }
      
      console.log(`TournamentService.getUpcomingTournaments() - получено турниров: ${response.data.length}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming tournaments:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Get ongoing tournaments
   */
  public async getOngoingTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'ONGOING' };
    if (limit) {
      params.limit = limit;
    }
    try {
      const response = await this.get<Tournament[]>('/tournaments', params);
      // Проверка и гарантия того, что возвращается массив
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching ongoing tournaments:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Get completed tournaments
   */
  public async getCompletedTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'COMPLETED' };
    if (limit) {
      params.limit = limit;
    }
    try {
      const response = await this.get<Tournament[]>('/tournaments', params);
      // Проверка и гарантия того, что возвращается массив
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching completed tournaments:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Get tournament locations
   */
  public async getTournamentLocations(): Promise<string[]> {
    try {
      const response = await this.get<string[]>('/locations');
      return response.data;
    } catch (error) {
      console.error("Error fetching tournament locations:", error);
      return [];
    }
  }

  /**
   * Register team for tournament
   */
  public async registerForTournament(
    tournamentId: number,
    teamName: string,
    playerIds: string[],
    teamLogo?: File
  ): Promise<TournamentResponse> {
    let token = getStoredToken();
    console.log('Initial token check:', {
      hasToken: !!token,
      tokenFirstChars: token ? token.substring(0, 10) : null,
      tokenLastChars: token ? token.substring(token.length - 10) : null
    });

    if (!token) {
      throw new Error('Для регистрации команды необходимо авторизоваться');
    }

    try {
      // Проверяем валидность токена
      const decoded = jwtDecode(token) as DecodedToken;
      const currentTime = Date.now() / 1000;
      
      console.log('Token validation:', {
        tokenDecoded: true,
        expiresIn: decoded.exp - currentTime,
        isExpired: decoded.exp <= currentTime
      });

      // Если токен истекает в ближайшие 5 минут или уже истек, пробуем обновить
      if (decoded.exp <= currentTime + 300) {
        console.log('Token expired or expiring soon, attempting refresh...');
        try {
          const refreshResult = await authService.refreshToken();
          if (refreshResult.token) {
            token = refreshResult.token;
            console.log('Token refreshed successfully');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
        }
      }

      // Создаем FormData для отправки данных
      const formData = new FormData();
      formData.append('teamName', teamName);
      formData.append('playerIds', JSON.stringify(playerIds));
      if (teamLogo) {
        formData.append('teamLogo', teamLogo);
      }

      // Отправляем запрос на регистрацию
      const response = await this.post<TournamentResponse>(
        `/tournaments/${tournamentId}/teams/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error registering for tournament:', error);
      throw error;
    }
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Create new tournament
   */
  public async createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
    try {
      // Convert tournament data to URLSearchParams with snake_case keys
      const params = new URLSearchParams();
      Object.entries(tournament).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(this.camelToSnakeCase(key), value.toString());
        }
      });

      const response = await this.post<Tournament>('/', params);
      return response.data;
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  }

  /**
   * Update tournament
   */
  public async updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament> {
    try {
      const response = await this.put<Tournament>(`/${id}`, tournament);
      return response.data;
    } catch (error) {
      console.error(`Error updating tournament ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete tournament
   */
  public async deleteTournament(id: string): Promise<void> {
    try {
      await this.delete<void>(`/${id}`);
    } catch (error) {
      console.error(`Error deleting tournament ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const tournamentService = new TournamentService(); 