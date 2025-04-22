import apiService from './ApiService';

export interface Team {
  id: string;
  name: string;
  logo: string;
  captain: string;
  members: string[];
  wins: number;
  losses: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

export class TeamService {
  async getAllTeams(): Promise<Team[]> {
    return apiService.getAllTeams();
  }

  async getTeamById(id: string): Promise<Team> {
    return apiService.getTeamById(id);
  }

  async searchTeamsByName(name: string): Promise<Team[]> {
    return apiService.searchTeamsByName(name);
  }

  async getTopTeams(limit: number = 10): Promise<Team[]> {
    return apiService.getTopTeams(limit);
  }

  async getTournamentTeams(tournamentId: string, status?: string): Promise<any[]> {
    return apiService.getTournamentTeams(tournamentId, status);
  }
}

export default new TeamService(); 