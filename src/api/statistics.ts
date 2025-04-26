import api from './client';
import { API_ENDPOINTS } from '../config/apiConfig';
import { PlayerBasicStats } from '../interfaces/PlayerStatistics';

// API-функции для работы со статистикой игроков
export const statisticsApi = {
  // Получение топ игроков по категории
  getTopPlayers: async (category: string = 'points', limit: number = 10): Promise<PlayerBasicStats[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.statistics.topPlayers, {
        params: { 
          category, 
          limit 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching top players by ${category}:`, error);
      throw error;
    }
  },

  // Получение рейтинга игрока
  getPlayerRating: async (playerId: string | number): Promise<number> => {
    try {
      const playerData = await api.get(API_ENDPOINTS.statistics.playerRating(playerId));
      return playerData.rating || 0;
    } catch (error) {
      console.error(`Error fetching rating for player ${playerId}:`, error);
      throw error;
    }
  }
};

export default statisticsApi; 