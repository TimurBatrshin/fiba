import { AuthService } from './AuthService';
import { TournamentService, tournamentService } from './TournamentService';
import { UserService, userService } from './UserService';
import { TeamService } from './TeamService';
import { PlayerService } from './PlayerService';
import { MatchService } from './MatchService';

/**
 * Factory to get the appropriate service implementation
 */
export class ServiceFactory {
  /**
   * Get auth service instance
   */
  static getAuthService(): AuthService {
    return AuthService.getInstance();
  }
  
  /**
   * Get tournament service instance
   */
  static getTournamentService(): TournamentService {
    return tournamentService;
  }
  
  /**
   * Get user service instance
   */
  static getUserService(): UserService {
    return userService;
  }
  
  /**
   * Get team service instance
   */
  static getTeamService(): TeamService {
    return new TeamService();
  }
  
  /**
   * Get player service instance
   */
  static getPlayerService(): PlayerService {
    return new PlayerService();
  }
  
  /**
   * Get match service instance
   */
  static getMatchService(): MatchService {
    return new MatchService();
  }
} 