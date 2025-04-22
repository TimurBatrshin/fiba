import { BaseApiService, ApiResponse } from './BaseApiService';
import { Tournament, TournamentLevel, TournamentStatus } from '../interfaces/Tournament';
import { API_CONFIG } from '../config/api';

export interface TournamentFilter {
  status?: TournamentStatus;
  location?: string;
  startDate?: string;
  endDate?: string;
  level?: TournamentLevel;
}

export class TournamentService extends BaseApiService {
  constructor() {
    super(API_CONFIG.baseUrl, API_CONFIG.mockUrl, API_CONFIG.useMockByDefault);
  }

  /**
   * Get all tournaments
   */
  public async getAllTournaments(): Promise<Tournament[]> {
    const response = await this.get<Tournament[]>('/tournaments');
    return response.data;
  }

  /**
   * Get tournaments filtered by criteria
   */
  public async getTournaments(filter: TournamentFilter): Promise<Tournament[]> {
    const response = await this.get<Tournament[]>('/tournaments', filter);
    return response.data;
  }

  /**
   * Get tournament by ID
   */
  public async getTournamentById(id: string): Promise<Tournament> {
    const response = await this.get<Tournament>(`/tournaments/${id}`);
    return response.data;
  }

  /**
   * Get upcoming tournaments
   */
  public async getUpcomingTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'upcoming' };
    if (limit) {
      params.limit = limit;
    }
    const response = await this.get<Tournament[]>('/tournaments', params);
    return response.data;
  }

  /**
   * Get ongoing tournaments
   */
  public async getOngoingTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'ongoing' };
    if (limit) {
      params.limit = limit;
    }
    const response = await this.get<Tournament[]>('/tournaments', params);
    return response.data;
  }

  /**
   * Get completed tournaments
   */
  public async getCompletedTournaments(limit?: number): Promise<Tournament[]> {
    const params: Record<string, any> = { status: 'completed' };
    if (limit) {
      params.limit = limit;
    }
    const response = await this.get<Tournament[]>('/tournaments', params);
    return response.data;
  }

  /**
   * Get tournament locations
   */
  public async getTournamentLocations(): Promise<string[]> {
    const response = await this.get<string[]>('/tournaments/locations');
    return response.data;
  }

  /**
   * Register user for tournament
   */
  public async registerForTournament(tournamentId: string, userId: string): Promise<any> {
    const response = await this.post<any>(`/tournaments/${tournamentId}/register`, { userId });
    return response.data;
  }

  /**
   * Create new tournament
   */
  public async createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
    const response = await this.post<Tournament>('/tournaments', tournament);
    return response.data;
  }

  /**
   * Update tournament
   */
  public async updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament> {
    const response = await this.put<Tournament>(`/tournaments/${id}`, tournament);
    return response.data;
  }

  /**
   * Delete tournament
   */
  public async deleteTournament(id: string): Promise<void> {
    await this.delete<void>(`/tournaments/${id}`);
  }
}

// Create and export a singleton instance
export const tournamentService = new TournamentService(); 