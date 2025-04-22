import apiService from './ApiService';

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  maxTeams: number;
  currentTeams: number;
  entryFee: number;
  prizePool: number;
  sponsors: string[];
  rules: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentCreateInput {
  name: string;
  date: string;
  location: string;
  description: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  maxTeams: number;
  entryFee: number;
  prizePool: number;
  sponsors: string[];
  rules: string;
}

export interface TeamStatusUpdate {
  tournamentId: string;
  teamId: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'COMPLETED';
}

export class TournamentService {
  async getAllTournaments(): Promise<Tournament[]> {
    return apiService.getAllTournaments();
  }

  async getTournamentById(id: string): Promise<Tournament> {
    return apiService.getTournamentById(id);
  }

  async getUpcomingTournaments(): Promise<Tournament[]> {
    return apiService.getUpcomingTournaments();
  }

  async getCompletedTournaments(): Promise<Tournament[]> {
    return apiService.getCompletedTournaments();
  }

  async searchTournamentsByLocation(location: string): Promise<Tournament[]> {
    return apiService.searchTournamentsByLocation(location);
  }

  async getBusinessTournaments(): Promise<Tournament[]> {
    return apiService.getBusinessTournaments();
  }

  async createTournament(tournamentData: TournamentCreateInput): Promise<Tournament> {
    return apiService.createTournament(tournamentData);
  }

  async updateTeamStatus({ tournamentId, teamId, status }: TeamStatusUpdate): Promise<any> {
    return apiService.updateTeamStatus(tournamentId, teamId, status);
  }

  async getTournamentTeams(tournamentId: string, status?: string): Promise<any[]> {
    return apiService.getTournamentTeams(tournamentId, status);
  }
}

export default new TournamentService(); 