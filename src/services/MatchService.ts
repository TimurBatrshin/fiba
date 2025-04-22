import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { Match, MatchFilter, MatchScore } from '../interfaces/Match';

export class MatchService extends BaseApiService {
  constructor() {
    super(API_CONFIG.baseUrl, API_CONFIG.mockUrl, API_CONFIG.useMockByDefault);
  }

  /**
   * Get all matches
   */
  public async getAllMatches(): Promise<Match[]> {
    const response = await this.get<Match[]>('/matches');
    return response.data;
  }

  /**
   * Get matches with optional filtering
   */
  public async getMatches(filter: MatchFilter = {}): Promise<Match[]> {
    const response = await this.get<Match[]>('/matches', filter);
    return response.data;
  }

  /**
   * Get a match by ID
   */
  public async getMatchById(id: string): Promise<Match> {
    const response = await this.get<Match>(`/matches/${id}`);
    return response.data;
  }

  /**
   * Get matches for a specific tournament
   */
  public async getTournamentMatches(tournamentId: string): Promise<Match[]> {
    const response = await this.get<Match[]>(`/tournaments/${tournamentId}/matches`);
    return response.data;
  }

  /**
   * Get matches for a specific tournament and round
   */
  public async getTournamentRoundMatches(tournamentId: string, round: number): Promise<Match[]> {
    const response = await this.get<Match[]>(`/tournaments/${tournamentId}/matches`, { round });
    return response.data;
  }

  /**
   * Update a match score
   */
  public async updateMatchScore(matchId: string, score: MatchScore): Promise<Match> {
    const response = await this.put<Match>(`/matches/${matchId}/score`, score);
    return response.data;
  }

  /**
   * Create a new match
   */
  public async createMatch(match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    const response = await this.post<Match>('/matches', match);
    return response.data;
  }

  /**
   * Update a match
   */
  public async updateMatch(id: string, match: Partial<Match>): Promise<Match> {
    const response = await this.put<Match>(`/matches/${id}`, match);
    return response.data;
  }

  /**
   * Delete a match
   */
  public async deleteMatch(id: string): Promise<void> {
    await this.delete<void>(`/matches/${id}`);
  }
}

// Create and export a singleton instance
export const matchService = new MatchService(); 