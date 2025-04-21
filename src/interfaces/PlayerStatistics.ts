export interface PlayerBasicStats {
  id: number;
  name: string;
  teamName?: string;
  photoUrl?: string;
  totalPoints: number;
  rating: number;
}

export interface PlayerStatistics {
  playerId: string;
  points: number;
  rebounds: number;
  assists: number;
  efficiency?: number;
  gamesPlayed?: number;
  avgPoints?: number;
  avgRebounds?: number;
  avgAssists?: number;
  rating?: number;
  rank?: number;
  tournamentId?: string;
  tournamentName?: string;
}

export interface TeamStatistics {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  points: number;
  tournamentId?: string;
  tournamentName?: string;
  rank?: number;
  rating?: number;
} 