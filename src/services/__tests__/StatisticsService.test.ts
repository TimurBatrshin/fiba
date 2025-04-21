import { StatisticsService } from '../StatisticsService';
import { API_BASE_URL } from '../config';
import defaultAvatar from '../../assets/images/default-avatar.png';

// Mock console methods to prevent output in tests
console.warn = jest.fn();
console.error = jest.fn();
console.log = jest.fn();

describe('StatisticsService', () => {
  // Get an instance of the service
  const statisticsService = StatisticsService.getInstance();
  
  // Store original fetch for cleanup
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set location.hostname to 'localhost' for dev mode tests
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost'
      },
      writable: true
    });
    
    // Explicitly set mock data mode for tests
    statisticsService.setMockDataMode(true);
    
    // Mock fetch for the tests
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    ) as jest.Mock;
  });
  
  afterAll(() => {
    // Restore original fetch after all tests
    global.fetch = originalFetch;
  });
  
  describe('getTopPlayers', () => {
    it('should return top players by points in dev mode', async () => {
      // Call the service method
      const result = await statisticsService.getTopPlayers('points', 5);
      
      // Check that fetch was not called (since we're using mock data in dev mode)
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Check the result
      expect(result).toHaveLength(5);
      expect(result[0].totalPoints).toBeGreaterThanOrEqual(result[1].totalPoints);
      expect(result[1].totalPoints).toBeGreaterThanOrEqual(result[2].totalPoints);
    });
    
    it('should return top players by rating in dev mode', async () => {
      // Call the service method
      const result = await statisticsService.getTopPlayers('rating', 5);
      
      // Check the result
      expect(result).toHaveLength(5);
      expect(result[0].rating).toBeGreaterThanOrEqual(result[1].rating);
      expect(result[1].rating).toBeGreaterThanOrEqual(result[2].rating);
    });
    
    it('should respect the limit parameter', async () => {
      // Call the service method with different limits
      const result1 = await statisticsService.getTopPlayers('points', 3);
      const result2 = await statisticsService.getTopPlayers('points', 7);
      
      // Check that the results have the right length
      expect(result1).toHaveLength(3);
      expect(result2).toHaveLength(7);
    });
    
    it('should call API in production mode', async () => {
      // Set production environment
      statisticsService.setMockDataMode(false);
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Test Player', totalPoints: 500, rating: 95 }
          ])
        })
      );
      
      // Call the service method
      await statisticsService.getTopPlayers('points', 5);
      
      // Verify that fetch was called with the right parameters
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/statistics/top-players?category=points&limit=5'));
    });
    
    it('should handle API errors in production mode', async () => {
      // Set production environment
      statisticsService.setMockDataMode(false);
      
      // Mock API error
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500
        })
      );
      
      // Call the service method
      const result = await statisticsService.getTopPlayers('points', 5);
      
      // Check that we get fallback mock data
      expect(result).toHaveLength(5);
      expect(console.warn).toHaveBeenCalledWith('Falling back to mock data due to API error');
    });
  });
  
  describe('calculatePlayerRating', () => {
    it('should return player rating in dev mode', async () => {
      // Call the service method for an existing player (id=1)
      const result = await statisticsService.calculatePlayerRating(1);
      
      // Check that fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Check the result (rating should be a number in a specific range)
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(70);
      expect(result).toBeLessThanOrEqual(100);
    });
    
    it('should call API in production mode for calculatePlayerRating', async () => {
      // Set production environment
      statisticsService.setMockDataMode(false);
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rating: 85 })
        })
      );
      
      // Call the service method
      const result = await statisticsService.calculatePlayerRating(1);
      
      // Verify that fetch was called with the right parameters
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/statistics/player/1/rating'));
      
      // Check the result
      expect(result).toBe(85);
    });
    
    it('should handle API errors for calculatePlayerRating', async () => {
      // Set production environment
      statisticsService.setMockDataMode(false);
      
      // Mock API error
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 404
        })
      );
      
      // Call the service method
      const result = await statisticsService.calculatePlayerRating(999);
      
      // Check that we get fallback mock data
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(70);
      expect(result).toBeLessThanOrEqual(100);
      expect(console.warn).toHaveBeenCalledWith('Falling back to mock data due to API error');
    });
  });
}); 