export interface Fixture {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  time: string;
  venue: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  homeTeamScore?: number;
  awayTeamScore?: number;
  round: number;
  group?: string;
  stage: 'GROUP' | 'KNOCKOUT' | 'FINAL';
  createdAt: string;
  updatedAt: string;
}

export interface FixtureFilter {
  tournamentId?: number;
  teamId?: number;
  status?: Fixture['status'];
  dateFrom?: string;
  dateTo?: string;
  round?: number;
  stage?: Fixture['stage'];
  group?: string;
  search?: string;
}

export interface FixtureState {
  fixtures: Fixture[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filter?: FixtureFilter;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
} 