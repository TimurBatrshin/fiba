import { BaseApiService } from './BaseApiService';
import { User } from '../interfaces/Auth';
import { API_CONFIG } from '../config/api';
import api from '../api/client';
import { API_ENDPOINTS } from '../config/apiConfig';

export interface Player extends User {
  photoUrl?: string;
  avatar?: string;
  rating?: number;
  tournamentHistory?: string[];
  stats?: {
    gamesPlayed: number;
    avgPoints: number;
    avgRebounds: number;
    avgAssists: number;
  };
}

// Дополнительный интерфейс для результатов поиска игроков
export interface SearchPlayer {
  id: string | number;
  name: string;
  email?: string;
  photoUrl?: string;
  avatar?: string;
  rating?: number;
}

// Расширенный интерфейс игрока с базовой статистикой
export interface PlayerWithStats extends Player {
  totalPoints: number;
  totalGames: number;
  avgPoints: number;
  winRate: number;
}

// Интерфейс для детальной статистики игрока
export interface PlayerDetailedStats {
  id: string;
  name: string;
  photoUrl?: string;
  rating: number;
  teamName?: string;
  totalGames: number;
  totalPoints: number;
  avgPoints: number;
  tournaments: {
    id: string;
    name: string;
    date: string;
    points: number;
    place?: number;
  }[];
  pointsHistory: number[];
}

// Интерфейс для полной статистики игрока
export interface PlayerStatistics {
  id: string;
  name: string;
  photoUrl?: string;
  email?: string;
  rating: number;
  teamName?: string;
  position?: string;
  totalGames: number;
  totalPoints: number;
  avgPoints: number;
  winRate?: number;
  tournaments: {
    id: string;
    name: string;
    date: string;
    points: number;
    place?: number;
  }[];
  pointsHistory: number[];
  matchStats?: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  };
  achievements?: {
    id: string;
    title: string;
    description: string;
    date: string;
  }[];
}

export class PlayerService extends BaseApiService {
  private static instance: PlayerService;

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  constructor() {
    super(API_CONFIG.baseUrl);
  }

  /**
   * Get all players
   */
  public async getAllPlayers(): Promise<Player[]> {
    const response = await this.get<Player[]>('/players');
    return response.data;
  }

  /**
   * Get player by ID
   */
  public async getPlayerById(id: string): Promise<Player> {
    const response = await this.get<Player>(API_ENDPOINTS.players.byId(id));
    return response.data;
  }

  /**
   * Get top players by rating
   */
  public async getTopPlayers(limit: number = 5): Promise<Player[]> {
    const response = await this.get<Player[]>('/players/top', { limit });
    return response.data;
  }

  /**
   * Create new player
   */
  public async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const response = await this.post<Player>('/players', player);
    return response.data;
  }

  /**
   * Update player
   */
  public async updatePlayer(id: string, player: Partial<Player>): Promise<Player> {
    const response = await this.put<Player>(`/players/${id}`, player);
    return response.data;
  }

  /**
   * Delete player
   */
  public async deletePlayer(id: string): Promise<void> {
    await this.delete<void>(`/players/${id}`);
  }

  // Получение базовой статистики игрока
  async getPlayerBasicStats(id: string): Promise<PlayerWithStats> {
    const response = await this.get<PlayerWithStats>(API_ENDPOINTS.players.getBasicStats(id));
    return response.data;
  }

  // Получение детальной статистики игрока
  async getPlayerDetailedStats(id: string): Promise<PlayerDetailedStats> {
    const response = await this.get<PlayerDetailedStats>(API_ENDPOINTS.players.getDetailedStats(id));
    return response.data;
  }

  // Получение полной статистики игрока
  async getPlayerStatistics(id: string): Promise<PlayerStatistics> {
    const response = await this.get<PlayerStatistics>(API_ENDPOINTS.players.getStatistics(id));
    return response.data;
  }

  // Получение рейтинга игроков
  async getPlayersRankings(limit?: number): Promise<PlayerWithStats[]> {
    const params = limit ? { limit } : undefined;
    const response = await this.get<PlayerWithStats[]>(API_ENDPOINTS.players.rankings, { params });
    return response.data;
  }

  /**
   * Поиск игроков по имени или email
   * @param query Строка поиска
   */
  async searchPlayers(query: string): Promise<SearchPlayer[]> {
    try {
      console.log('Поиск игроков с запросом:', query);
      // Исправляем формат параметров запроса - убираем вложенный params объект
      const response = await this.get<SearchPlayer[]>(API_ENDPOINTS.players.search, { 
        params: { query } 
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске игроков:', error);
      throw error;
    }
  }
}

// Создаем экземпляр сервиса для удобного импорта
export const playerService = PlayerService.getInstance();

// Функция поиска игроков для поддержки обратной совместимости
export const searchPlayers = async (query: string): Promise<SearchPlayer[]> => {
  try {
    // Исправляем формат параметров запроса - убираем encodeURIComponent и используем правильный формат
    const response = await api.get(API_ENDPOINTS.players.search, { params: { query } });
    return response.data;
  } catch (error) {
    console.error('Ошибка при поиске игроков:', error);
    throw error;
  }
};

export default playerService; 