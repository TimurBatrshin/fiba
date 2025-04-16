// Интерфейсы для статистики игроков

// Базовая статистика игрока
export interface PlayerBasicStats {
  id: string;
  name: string;
  userId?: string;
  photoUrl?: string;
  teamId?: string;
  teamName?: string;
  rating: number;
  tournamentsPlayed: number;
  totalPoints: number;
}

// Детальная статистика игрока
export interface PlayerDetailedStats extends PlayerBasicStats {
  pointsPerGame: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  onePointsMade: number;
  onePointsAttempted: number;
  rebounds: number;
  blocks: number;
  assists: number;
  steals: number;
  turnovers: number;
  personalFouls: number;
}

// Статистика игрока за конкретный турнир
export interface TournamentPlayerStats {
  tournamentId: string;
  tournamentName: string;
  date: string;
  pointsScored: number;
  gamesPlayed: number;
  wins: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  onePointsMade: number;
  onePointsAttempted: number;
  rebounds: number;
  blocks: number;
  assists: number;
  steals: number;
  turnovers: number;
}

// Статистика по игроку за игру
export interface GameStats {
  gameId: string;
  gameDate: string;
  opponentTeam: string;
  pointsScored: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  onePointsMade: number;
  onePointsAttempted: number;
  rebounds: number;
  blocks: number;
  assists: number;
  steals: number;
  turnovers: number;
  personalFouls: number;
  minutesPlayed: number;
  isWin: boolean;
}

// Прогресс игрока (для отслеживания тенденций)
export interface PlayerProgress {
  period: string; // месяц/год или идентификатор периода
  rating: number;
  pointsPerGame: number;
  twoPointPercentage: number;
  onePointPercentage: number;
  rebounds: number;
  blocks: number;
  assists: number;
}

// Для рейтинга турниров
export interface TournamentRanking {
  id: string;
  name: string;
  date: string;
  location: string;
  level: string;
  teamsCount: number;
  popularity: number; // на основе количества просмотров, регистраций и т.д.
  prizePool: number;
  rating: number; // средний рейтинг на основе отзывов участников
} 