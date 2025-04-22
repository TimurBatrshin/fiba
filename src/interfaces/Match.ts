import { Team } from './Team';

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  date: string;
  time: string;
  court?: string;
  round: number;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  scoreA: number;
  scoreB: number;
  isCompleted?: boolean;
}

export interface MatchFilter {
  tournamentId?: string;
  round?: number;
  status?: MatchStatus;
  date?: string;
} 