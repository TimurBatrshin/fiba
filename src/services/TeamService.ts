import apiService from './ApiService';
import { Team, Player, TeamPlayer } from '../interfaces/Team';
import { RegistrationStatus } from '../interfaces/Tournament';

export class TeamService {
  /**
   * Gets all teams
   */
  async getAllTeams(): Promise<Team[]> {
    return apiService.getAllTeams();
  }

  /**
   * Gets a team by ID
   */
  async getTeamById(id: string): Promise<Team> {
    return apiService.getTeamById(id);
  }

  /**
   * Searches teams by name
   */
  async searchTeamsByName(name: string): Promise<Team[]> {
    return apiService.searchTeamsByName(name);
  }

  /**
   * Gets top teams by rating
   */
  async getTopTeams(limit: number = 10): Promise<Team[]> {
    return apiService.getTopTeams(limit);
  }

  /**
   * Gets teams in a tournament
   */
  async getTournamentTeams(tournamentId: string, status?: RegistrationStatus): Promise<any[]> {
    return apiService.getTournamentTeams(tournamentId, status);
  }

  /**
   * Gets players in a team
   */
  async getTeamPlayers(teamId: string): Promise<Player[]> {
    return apiService.get<Player[]>(`/api/teams/${teamId}/players`);
  }

  /**
   * Adds a player to a team
   */
  async addPlayerToTeam(teamId: string, playerId: string): Promise<TeamPlayer> {
    return apiService.post<TeamPlayer>(`/api/teams/${teamId}/players`, { playerId });
  }

  /**
   * Removes a player from a team
   */
  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    return apiService.delete<void>(`/api/teams/${teamId}/players/${playerId}`);
  }

  /**
   * Creates a new team
   */
  async createTeam(teamData: Partial<Team>): Promise<Team> {
    return apiService.post<Team>('/api/teams', teamData);
  }

  /**
   * Updates a team
   */
  async updateTeam(teamId: string, teamData: Partial<Team>): Promise<Team> {
    return apiService.put<Team>(`/api/teams/${teamId}`, teamData);
  }

  /**
   * Deletes a team
   */
  async deleteTeam(teamId: string): Promise<void> {
    return apiService.delete<void>(`/api/teams/${teamId}`);
  }
}

export default new TeamService(); 