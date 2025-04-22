import apiService from './ApiService';
import { 
  Tournament, 
  TournamentStatus, 
  TournamentLevel, 
  BusinessType, 
  TournamentTeam, 
  Registration, 
  RegistrationStatus 
} from '../interfaces/Tournament';

export interface TournamentCreateInput {
  name: string;
  date: string;
  startTime: string;
  location: string;
  description: string;
  status: TournamentStatus;
  level: TournamentLevel;
  imageUrl?: string;
  businessType: BusinessType;
  maxTeams: number;
  entryFee: number;
  prizePool: string;
  isBusinessTournament: boolean;
  sponsorName?: string;
  sponsorLogo?: string;
  rules?: string;
  registrationOpen: boolean;
}

export interface TeamStatusUpdate {
  tournamentId: string;
  teamId: string;
  status: RegistrationStatus;
}

export class TournamentService {
  /**
   * Retrieves all tournaments
   */
  async getAllTournaments(): Promise<Tournament[]> {
    return apiService.getAllTournaments();
  }

  /**
   * Gets tournament by ID
   */
  async getTournamentById(id: string): Promise<Tournament> {
    return apiService.getTournamentById(id);
  }

  /**
   * Gets upcoming tournaments
   */
  async getUpcomingTournaments(): Promise<Tournament[]> {
    return apiService.getUpcomingTournaments();
  }

  /**
   * Gets completed tournaments
   */
  async getCompletedTournaments(): Promise<Tournament[]> {
    return apiService.getCompletedTournaments();
  }

  /**
   * Searches tournaments by location
   */
  async searchTournamentsByLocation(location: string): Promise<Tournament[]> {
    return apiService.searchTournamentsByLocation(location);
  }

  /**
   * Gets business tournaments
   */
  async getBusinessTournaments(): Promise<Tournament[]> {
    return apiService.getBusinessTournaments();
  }

  /**
   * Creates a new tournament
   */
  async createTournament(tournamentData: TournamentCreateInput): Promise<Tournament> {
    return apiService.createTournament(tournamentData);
  }

  /**
   * Updates team status in a tournament
   */
  async updateTeamStatus({ tournamentId, teamId, status }: TeamStatusUpdate): Promise<any> {
    return apiService.updateTeamStatus(tournamentId, teamId, status);
  }

  /**
   * Gets teams in a tournament
   */
  async getTournamentTeams(tournamentId: string, status?: RegistrationStatus): Promise<TournamentTeam[]> {
    return apiService.getTournamentTeams(tournamentId, status);
  }

  /**
   * Gets registrations for a tournament
   */
  async getRegistrations(tournamentId: string, status?: RegistrationStatus): Promise<Registration[]> {
    return apiService.getTournamentRegistrations(tournamentId, status);
  }

  /**
   * Registers a team for a tournament
   */
  async registerTeam(tournamentId: string, teamName: string): Promise<Registration> {
    return apiService.registerTeamForTournament(tournamentId, teamName);
  }

  /**
   * Adds a player to a registration
   */
  async addPlayerToRegistration(registrationId: string, userId: string): Promise<any> {
    return apiService.addPlayerToRegistration(registrationId, userId);
  }

  /**
   * Removes a player from a registration
   */
  async removePlayerFromRegistration(registrationId: string, userId: string): Promise<any> {
    return apiService.removePlayerFromRegistration(registrationId, userId);
  }
}

export default new TournamentService(); 