import { BaseApiService } from './BaseApiService';
import { User } from '../interfaces/Auth';
import { API_CONFIG } from '../config/api';

export interface Player extends User {
  rating?: number;
  tournamentHistory?: string[];
  stats?: {
    gamesPlayed: number;
    avgPoints: number;
    avgRebounds: number;
    avgAssists: number;
  };
}

export class PlayerService extends BaseApiService {
  constructor() {
    super(API_CONFIG.baseUrl, API_CONFIG.mockUrl, API_CONFIG.useMockByDefault);
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
    const response = await this.get<Player>(`/players/${id}`);
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
}

// Create and export a singleton instance
export const playerService = new PlayerService(); 