import ApiService from './ApiService';
import {
  PlayerBasicStats,
  PlayerDetailedStats,
  TournamentPlayerStats,
  GameStats,
  PlayerProgress,
  TournamentRanking
} from '../interfaces/PlayerStatistics';

export const StatisticsService = {
  // Получение базовой статистики игрока
  async getPlayerBasicStats(playerId: string): Promise<PlayerBasicStats> {
    return ApiService.get<PlayerBasicStats>(`/players/${playerId}/stats/basic`);
  },

  // Получение детальной статистики игрока
  async getPlayerDetailedStats(playerId: string): Promise<PlayerDetailedStats> {
    return ApiService.get<PlayerDetailedStats>(`/players/${playerId}/stats/detailed`);
  },

  // Получение статистики игрока по конкретному турниру
  async getPlayerTournamentStats(playerId: string, tournamentId: string): Promise<TournamentPlayerStats> {
    return ApiService.get<TournamentPlayerStats>(`/players/${playerId}/tournaments/${tournamentId}/stats`);
  },

  // Получение статистики игрока по всем турнирам
  async getPlayerAllTournamentsStats(playerId: string): Promise<TournamentPlayerStats[]> {
    return ApiService.get<TournamentPlayerStats[]>(`/players/${playerId}/tournaments/stats`);
  },

  // Получение статистики игрока по играм
  async getPlayerGameStats(playerId: string): Promise<GameStats[]> {
    return ApiService.get<GameStats[]>(`/players/${playerId}/games/stats`);
  },

  // Получение данных о прогрессе игрока
  async getPlayerProgress(playerId: string): Promise<PlayerProgress[]> {
    return ApiService.get<PlayerProgress[]>(`/players/${playerId}/progress`);
  },

  // Получение рейтинга турниров
  async getTournamentRankings(limit: number = 10): Promise<TournamentRanking[]> {
    return ApiService.get<TournamentRanking[]>(`/tournaments/rankings`, { params: { limit } });
  },

  // Обновление статистики игрока по игре
  async updatePlayerGameStats(playerId: string, gameId: string, stats: Partial<GameStats>): Promise<GameStats> {
    return ApiService.put<GameStats>(`/players/${playerId}/games/${gameId}/stats`, stats);
  },

  // Получение списка лучших игроков
  async getTopPlayers(category: string, limit: number = 10): Promise<PlayerBasicStats[]> {
    return ApiService.get<PlayerBasicStats[]>(`/players/rankings`, { params: { category, limit } });
  }
}; 