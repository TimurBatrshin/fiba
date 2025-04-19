import { UserService } from '../UserService';
import ApiService from '../ApiService';

// Мокируем ApiService
jest.mock('../ApiService', () => ({
  get: jest.fn(),
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('UserService', () => {
  const mockUsers = [
    { id: '1', username: 'user1', email: 'user1@example.com', fullName: 'User One' },
    { id: '2', username: 'user2', email: 'user2@example.com', fullName: 'User Two' }
  ];
  
  const mockUser = { 
    id: '1', 
    username: 'user1', 
    email: 'user1@example.com', 
    fullName: 'User One',
    photoUrl: 'https://example.com/photo.jpg'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getAllUsers', () => {
    it('should fetch all users from API', async () => {
      // Устанавливаем мок для ответа API
      (ApiService.get as jest.Mock).mockResolvedValue(mockUsers);
      
      // Вызываем метод сервиса
      const result = await UserService.getAllUsers();
      
      // Проверяем, что API был вызван с правильными параметрами
      expect(ApiService.get).toHaveBeenCalledWith('/users');
      
      // Проверяем, что метод возвращает правильный результат
      expect(result).toEqual(mockUsers);
    });
    
    it('should throw an error when API call fails', async () => {
      // Устанавливаем мок для ошибки API
      const error = new Error('API error');
      (ApiService.get as jest.Mock).mockRejectedValue(error);
      
      // Проверяем, что метод пробрасывает ошибку
      await expect(UserService.getAllUsers()).rejects.toThrow('API error');
      
      // Проверяем, что API был вызван
      expect(ApiService.get).toHaveBeenCalledWith('/users');
    });
  });
  
  describe('searchUsers', () => {
    it('should search users by query', async () => {
      // Устанавливаем мок для ответа API
      (ApiService.get as jest.Mock).mockResolvedValue([mockUsers[0]]);
      
      // Вызываем метод сервиса
      const result = await UserService.searchUsers('user1');
      
      // Проверяем, что API был вызван с правильными параметрами
      expect(ApiService.get).toHaveBeenCalledWith('/users/search', { params: { query: 'user1' } });
      
      // Проверяем, что метод возвращает правильный результат
      expect(result).toEqual([mockUsers[0]]);
    });
    
    it('should return empty array when no matches found', async () => {
      // Устанавливаем мок для пустого ответа API
      (ApiService.get as jest.Mock).mockResolvedValue([]);
      
      // Вызываем метод сервиса
      const result = await UserService.searchUsers('nonexistent');
      
      // Проверяем, что API был вызван с правильными параметрами
      expect(ApiService.get).toHaveBeenCalledWith('/users/search', { params: { query: 'nonexistent' } });
      
      // Проверяем, что метод возвращает пустой массив
      expect(result).toEqual([]);
    });
    
    it('should throw an error when API call fails', async () => {
      // Устанавливаем мок для ошибки API
      const error = new Error('Search API error');
      (ApiService.get as jest.Mock).mockRejectedValue(error);
      
      // Проверяем, что метод пробрасывает ошибку
      await expect(UserService.searchUsers('user1')).rejects.toThrow('Search API error');
      
      // Проверяем, что API был вызван
      expect(ApiService.get).toHaveBeenCalledWith('/users/search', { params: { query: 'user1' } });
    });
  });
  
  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      // Устанавливаем мок для ответа API
      (ApiService.get as jest.Mock).mockResolvedValue(mockUser);
      
      // Вызываем метод сервиса
      const result = await UserService.getUserById('1');
      
      // Проверяем, что API был вызван с правильными параметрами
      expect(ApiService.get).toHaveBeenCalledWith('/users/1');
      
      // Проверяем, что метод возвращает правильный результат
      expect(result).toEqual(mockUser);
    });
    
    it('should throw an error when user not found', async () => {
      // Устанавливаем мок для ошибки API
      const error = new Error('User not found');
      (ApiService.get as jest.Mock).mockRejectedValue(error);
      
      // Проверяем, что метод пробрасывает ошибку
      await expect(UserService.getUserById('999')).rejects.toThrow('User not found');
      
      // Проверяем, что API был вызван
      expect(ApiService.get).toHaveBeenCalledWith('/users/999');
    });
  });
}); 