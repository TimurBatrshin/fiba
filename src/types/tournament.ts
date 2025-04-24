import { Tournament as ITournament, TournamentStatus, TournamentLevel, Registration } from '../interfaces/Tournament';

// Re-export the Tournament interface
export type Tournament = ITournament;

// Registration data for tournament
export interface TournamentRegistration {
  teamName: string;
  playerIds?: string[];
  userId?: string;
}

// Re-export other types
export type { TournamentStatus, TournamentLevel, Registration }; 