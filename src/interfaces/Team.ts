export interface Team {
  id: string;
  name: string;
  logo?: string;
  totalPoints: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  createdAt: string;
  updatedAt: string;
  players?: Player[];
}

export interface TeamPlayer {
  teamId: string;
  playerId: string;
}

export interface Player {
  id: string;
  name: string;
  photoUrl?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
} 