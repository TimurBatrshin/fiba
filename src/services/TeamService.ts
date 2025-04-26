import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { Team } from '../interfaces/Team';
import { Player } from './PlayerService';
import { RegistrationStatus } from '../interfaces/Tournament';

export interface TeamPlayer {
  teamId: string;
  playerId: string;
  joinedAt: Date;
  role: 'CAPTAIN' | 'PLAYER' | 'COACH';
}

export class TeamService extends BaseApiService {
  constructor() {
    super(API_CONFIG.baseUrl);
  }

  /**
   * Get all teams
   */
  public async getAllTeams(): Promise<Team[]> {
    const response = await this.get<Team[]>('/teams');
    return response.data;
  }

  /**
   * Get a team by ID
   */
  public async getTeamById(id: string): Promise<Team> {
    const response = await this.get<Team>(`/teams/${id}`);
    return response.data;
  }

  /**
   * Search teams by name
   */
  public async searchTeamsByName(name: string): Promise<Team[]> {
    const response = await this.get<Team[]>('/teams/search', { name });
    return response.data;
  }

  /**
   * Get top teams by rating
   */
  public async getTopTeams(limit: number = 10): Promise<Team[]> {
    const response = await this.get<Team[]>('/teams/top', { limit });
    return response.data;
  }

  /**
   * Get teams in a tournament
   */
  public async getTournamentTeams(tournamentId: string, status?: RegistrationStatus): Promise<Team[]> {
    const response = await this.get<Team[]>(`/tournaments/${tournamentId}/teams`, { status });
    return response.data;
  }

  /**
   * Get players in a team
   */
  public async getTeamPlayers(teamId: string): Promise<Player[]> {
    const response = await this.get<Player[]>(`/teams/${teamId}/players`);
    return response.data;
  }

  /**
   * Add a player to a team
   */
  public async addPlayerToTeam(teamId: string, playerId: string): Promise<TeamPlayer> {
    const response = await this.post<TeamPlayer>(`/teams/${teamId}/players`, { playerId });
    return response.data;
  }

  /**
   * Remove a player from a team
   */
  public async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    await this.delete<void>(`/teams/${teamId}/players/${playerId}`);
  }

  /**
   * Create a new team
   */
  public async createTeam(team: Partial<Team>): Promise<Team> {
    const response = await this.post<Team>('/teams', team);
    return response.data;
  }

  /**
   * Update a team
   */
  public async updateTeam(teamId: string, team: Partial<Team>): Promise<Team> {
    const response = await this.put<Team>(`/teams/${teamId}`, team);
    return response.data;
  }

  /**
   * Delete a team
   */
  public async deleteTeam(teamId: string): Promise<void> {
    await this.delete<void>(`/teams/${teamId}`);
  }
}

// Create and export a singleton instance
export const teamService = new TeamService(); 