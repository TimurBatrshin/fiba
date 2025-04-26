export type TournamentStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REGISTRATION';
export type TournamentLevel = 'PRO' | 'AMATEUR' | 'BUSINESS' | 'YOUTH';
export type BusinessType = 'OFFICIAL' | 'COMMUNITY' | 'CORPORATE' | 'EDUCATION';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Tournament {
  id: string | number;
  name: string;
  title?: string;
  date: string;
  startTime?: string;
  location: string;
  description?: string;
  status: TournamentStatus;
  level: string;
  imageUrl?: string;
  businessType?: string;
  maxTeams?: number;
  entryFee?: number;
  prizePool: string | number;
  isBusinessTournament?: boolean;
  sponsorName?: string;
  sponsorLogo?: string;
  registrationOpen?: boolean;
  teams?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentTeam {
  tournamentId: string;
  teamId: string;
  status: RegistrationStatus;
  registrationDate: string;
  position?: number;
}

export interface Registration {
  id: number;
  teamName: string;
  tournament: Tournament;
  captain: { id: number; name: string; email: string };
  players: Array<{ id: number; name: string; email: string }>;
  status: RegistrationStatus;
}

export interface PlayerTeam {
  registrationId: string;
  userId: string;
}

export interface Team {
  id: number;
  teamName: string;
  players: Array<{
    id: number;
    name: string;
    email: string;
    points: number;
    rating: number;
    tournaments_played: number;
    photo_url: string;
  }>;
  captain: { id: number; name: string; email: string };
  tournament: number;
  status: RegistrationStatus;
}

export interface Player {
  id: number;
  name: string;
  email: string;
  email_verified?: boolean;
  role?: string;
  profile?: {
    photo_url?: string;
    tournaments_played?: number;
    total_points?: number;
    rating?: number;
  };
} 