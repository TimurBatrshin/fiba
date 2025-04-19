import { StatisticsService } from '../StatisticsService';
import defaultAvatar from '../../assets/images/default-avatar.png';

// Мокируем fetch
global.fetch = jest.fn();

// Мокируем console для подавления предупреждений в тестах
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

describe('StatisticsService', () => {
  // Получаем экземпляр сервиса
  const statisticsService = StatisticsService.getInstance();
  
  // Мокируем API_BASE_URL
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Устанавливаем мок для location.hostname, чтобы всегда использовались моковые данные
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost'
      },
      writable: true
    });
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  describe('getTopPlayers', () => {
    it('should return top players by points in dev mode', async () => {
      // Вызываем метод сервиса
      const result = await statisticsService.getTopPlayers('points', 5);
      
      // Проверяем, что fetch не был вызван (используются моковые данные)
      expect(fetch).not.toHaveBeenCalled();
      
      // Проверяем результат
      expect(result).toHaveLength(5);
      expect(result[0].totalPoints).toBeGreaterThanOrEqual(result[1].totalPoints);
      expect(result[1].totalPoints).toBeGreaterThanOrEqual(result[2].totalPoints);
    });
    
    it('should return top players by rating in dev mode', async () => {
      // Вызываем метод сервиса
      const result = await statisticsService.getTopPlayers('rating', 5);
      
      // Проверяем результат
      expect(result).toHaveLength(5);
      expect(result[0].rating).toBeGreaterThanOrEqual(result[1].rating);
      expect(result[1].rating).toBeGreaterThanOrEqual(result[2].rating);
    });
    
    it('should respect the limit parameter', async () => {
      // Вызываем метод сервиса с разными лимитами
      const result1 = await statisticsService.getTopPlayers('points', 3);
      const result2 = await statisticsService.getTopPlayers('points', 7);
      
      // Проверяем, что результаты имеют соответствующую длину
      expect(result1).toHaveLength(3);
      expect(result2).toHaveLength(7);
    });
    
    it('should call API in production mode', async () => {
      // Имитируем production среду
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com'
        },
        writable: true
      });
      
      // Мокируем успешный ответ API
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce([
          { id: 1, name: 'Test Player', totalPoints: 500, rating: 95 }
        ])
      });
      
      // Вызываем метод сервиса
      await statisticsService.getTopPlayers('points', 5);
      
      // Проверяем, что fetch был вызван с правильными параметрами
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/statistics/top-players?category=points&limit=5'));
    });
    
    it('should handle API errors in production mode', async () => {
      // Имитируем production среду
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com'
        },
        writable: true
      });
      
      // Мокируем ошибку API
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });
      
      // Вызываем метод сервиса
      const result = await statisticsService.getTopPlayers('points', 5);
      
      // Проверяем, что получены резервные моковые данные
      expect(result).toHaveLength(5);
      expect(console.warn).toHaveBeenCalledWith('Falling back to mock data due to API error');
    });
  });
  
  describe('calculatePlayerRating', () => {
    it('should return player rating in dev mode', async () => {
      // Вызываем метод сервиса для существующего игрока (id=1)
      const result = await statisticsService.calculatePlayerRating(1);
      
      // Проверяем, что fetch не был вызван
      expect(fetch).not.toHaveBeenCalled();
      
      // Проверяем результат (рейтинг должен быть числом в определенном диапазоне)
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(70);
      expect(result).toBeLessThanOrEqual(100);
    });
    
    it('should call API in production mode for calculatePlayerRating', async () => {
      // Имитируем production среду
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com'
        },
        writable: true
      });
      
      // Мокируем успешный ответ API
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ rating: 85 })
      });
      
      // Вызываем метод сервиса
      const result = await statisticsService.calculatePlayerRating(1);
      
      // Проверяем, что fetch был вызван с правильными параметрами
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/statistics/player/1/rating'));
      
      // Проверяем результат
      expect(result).toBe(85);
    });
    
    it('should handle API errors for calculatePlayerRating', async () => {
      // Имитируем production среду
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'example.com'
        },
        writable: true
      });
      
      // Мокируем ошибку API
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      // Вызываем метод сервиса
      const result = await statisticsService.calculatePlayerRating(999);
      
      // Проверяем, что получены резервные моковые данные
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(70);
      expect(result).toBeLessThanOrEqual(100);
      expect(console.warn).toHaveBeenCalledWith('Falling back to mock data due to API error');
    });
  });
}); 