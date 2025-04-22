import { UserService, User, UserUpdateInput } from '../UserService';
import apiService from '../ApiService';

// Мокируем ApiService
jest.mock('../ApiService', () => ({
  getCurrentUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn()
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Создаем новый экземпляр UserService перед каждым тестом
    userService = new UserService();
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should call apiService.getCurrentUser and return the result', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: '2023-05-01T12:00:00Z',
        updatedAt: '2023-05-10T15:30:00Z'
      };
      (apiService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getCurrentUser();

      // Assert
      expect(apiService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from apiService.getCurrentUser', async () => {
      // Arrange
      const mockError = new Error('Unauthorized');
      (apiService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getCurrentUser()).rejects.toThrow('Unauthorized');
      expect(apiService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should call apiService.getUserById with the correct ID and return the result', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: '2023-05-01T12:00:00Z',
        updatedAt: '2023-05-10T15:30:00Z'
      };
      (apiService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(apiService.getUserById).toHaveBeenCalledTimes(1);
      expect(apiService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from apiService.getUserById', async () => {
      // Arrange
      const userId = 'invalid-user';
      const mockError = new Error('User not found');
      (apiService.getUserById as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
      expect(apiService.getUserById).toHaveBeenCalledTimes(1);
      expect(apiService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should call apiService.updateUser with the correct parameters and return the result', async () => {
      // Arrange
      const userId = 'user-123';
      const userData: UserUpdateInput = {
        username: 'newUsername',
        email: 'newemail@example.com'
      };
      const mockUpdatedUser: User = {
        id: userId,
        username: userData.username!,
        email: userData.email!,
        role: 'user',
        createdAt: '2023-05-01T12:00:00Z',
        updatedAt: '2023-06-15T14:20:00Z'
      };
      (apiService.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await userService.updateUser(userId, userData);

      // Assert
      expect(apiService.updateUser).toHaveBeenCalledTimes(1);
      expect(apiService.updateUser).toHaveBeenCalledWith(userId, userData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should propagate errors from apiService.updateUser', async () => {
      // Arrange
      const userId = 'user-123';
      const userData: UserUpdateInput = {
        email: 'invalid-email'
      };
      const mockError = new Error('Validation error: Invalid email format');
      (apiService.updateUser as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.updateUser(userId, userData)).rejects.toThrow('Validation error');
      expect(apiService.updateUser).toHaveBeenCalledTimes(1);
      expect(apiService.updateUser).toHaveBeenCalledWith(userId, userData);
    });
  });

  describe('login', () => {
    it('should call apiService.login with the correct parameters and return the result', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        token: 'jwt-token-123',
        user: {
          id: 'user-123',
          username: 'testuser',
          email: email,
          role: 'user',
          createdAt: '2023-05-01T12:00:00Z',
          updatedAt: '2023-05-01T12:00:00Z'
        }
      };
      (apiService.login as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.login(email, password);

      // Assert
      expect(apiService.login).toHaveBeenCalledTimes(1);
      expect(apiService.login).toHaveBeenCalledWith({ email, password });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from apiService.login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockError = new Error('Invalid credentials');
      (apiService.login as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(apiService.login).toHaveBeenCalledTimes(1);
      expect(apiService.login).toHaveBeenCalledWith({ email, password });
    });
  });

  describe('register', () => {
    it('should call apiService.register with the correct parameters and return the result', async () => {
      // Arrange
      const username = 'newuser';
      const email = 'newuser@example.com';
      const password = 'password123';
      const mockResponse = {
        token: 'jwt-token-new',
        user: {
          id: 'user-new',
          username: username,
          email: email,
          role: 'user',
          createdAt: '2023-06-20T10:00:00Z',
          updatedAt: '2023-06-20T10:00:00Z'
        }
      };
      (apiService.register as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.register(username, email, password);

      // Assert
      expect(apiService.register).toHaveBeenCalledTimes(1);
      expect(apiService.register).toHaveBeenCalledWith({ 
        email, 
        password, 
        firstName: username, 
        lastName: '' 
      });
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from apiService.register', async () => {
      // Arrange
      const username = 'existinguser';
      const email = 'existing@example.com';
      const password = 'password123';
      const mockError = new Error('Email already in use');
      (apiService.register as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.register(username, email, password)).rejects.toThrow('Email already in use');
      expect(apiService.register).toHaveBeenCalledTimes(1);
      expect(apiService.register).toHaveBeenCalledWith({ 
        email, 
        password, 
        firstName: username, 
        lastName: '' 
      });
    });
  });

  describe('logout', () => {
    it('should call apiService.logout and return the result', async () => {
      // Arrange
      (apiService.logout as jest.Mock).mockResolvedValue(undefined);

      // Act
      await userService.logout();

      // Assert
      expect(apiService.logout).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from apiService.logout', async () => {
      // Arrange
      const mockError = new Error('Logout failed');
      (apiService.logout as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.logout()).rejects.toThrow('Logout failed');
      expect(apiService.logout).toHaveBeenCalledTimes(1);
    });
  });
}); 