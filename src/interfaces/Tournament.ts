export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type TournamentLevel = 'PRO' | 'AMATEUR' | 'BUSINESS' | 'YOUTH';
export type BusinessType = 'OFFICIAL' | 'COMMUNITY' | 'CORPORATE' | 'EDUCATION';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';

export interface Tournament {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface TournamentTeam {
  tournamentId: string;
  teamId: string;
  status: RegistrationStatus;
  registrationDate: string;
  position?: number;
}

export interface Registration {
  id: string;
  teamName: string;
  tournamentId: string;
  userId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  players?: Array<{userId: string}>;
}

export interface PlayerTeam {
  registrationId: string;
  userId: string;
} 