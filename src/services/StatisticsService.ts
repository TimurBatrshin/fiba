import { PlayerBasicStats } from '../interfaces/PlayerStatistics';
import { statisticsApi } from '../api';

export class StatisticsService {
  private static instance: StatisticsService;

  private constructor() {
    // Конструктор теперь пустой, так как используем API из api/statistics
  }

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  public async getTopPlayers(category: 'points' | 'rating', limit: number = 10): Promise<PlayerBasicStats[]> {
    try {
      // Используем централизованный API вместо прямых запросов fetch
      return await statisticsApi.getTopPlayers(category, limit);
    } catch (error) {
      console.error('Error fetching top players:', error);
      throw error;
    }
  }

  public async calculatePlayerRating(playerId: number): Promise<number> {
    try {
      // Используем централизованный API вместо прямых запросов fetch
      return await statisticsApi.getPlayerRating(playerId);
    } catch (error) {
      console.error('Error calculating player rating:', error);
      throw error;
    }
  }
} 