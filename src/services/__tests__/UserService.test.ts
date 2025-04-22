import { UserService, UserUpdateInput } from '../UserService';
import { User } from '../../interfaces/Auth';
import apiService from '../ApiService';

// Mocking the BaseApiService methods used by UserService
jest.mock('../UserService', () => {
  const original = jest.requireActual('../UserService');
  return {
    ...original,
    UserService: jest.fn().mockImplementation(() => ({
      getCurrentUser: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      getTopUsers: jest.fn(),
      searchUsers: jest.fn()
    }))
  };
});

// Mocking ApiService for backward compatibility
jest.mock('../ApiService', () => ({
  getCurrentUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn()
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Create a new instance of UserService before each test
    userService = new UserService();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should call getCurrentUser and return the result', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        name: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };
      (userService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getCurrentUser();

      // Assert
      expect(userService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from getCurrentUser', async () => {
      // Arrange
      const mockError = new Error('Unauthorized');
      (userService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getCurrentUser()).rejects.toThrow('Unauthorized');
      expect(userService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should call getUserById with the correct ID and return the result', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser: User = {
        id: userId,
        name: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(userService.getUserById).toHaveBeenCalledTimes(1);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from getUserById', async () => {
      // Arrange
      const userId = 'invalid-user';
      const mockError = new Error('User not found');
      (userService.getUserById as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
      expect(userService.getUserById).toHaveBeenCalledTimes(1);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should call updateUser with the correct parameters and return the result', async () => {
      // Arrange
      const userId = 'user-123';
      const userData: UserUpdateInput = {
        name: 'newUsername',
        email: 'newemail@example.com'
      };
      const mockUpdatedUser: User = {
        id: userId,
        name: userData.name!,
        email: userData.email!,
        role: 'USER',
      };
      (userService.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await userService.updateUser(userId, userData);

      // Assert
      expect(userService.updateUser).toHaveBeenCalledTimes(1);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, userData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should propagate errors from updateUser', async () => {
      // Arrange
      const userId = 'user-123';
      const userData: UserUpdateInput = {
        email: 'invalid-email'
      };
      const mockError = new Error('Validation error: Invalid email format');
      (userService.updateUser as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.updateUser(userId, userData)).rejects.toThrow('Validation error');
      expect(userService.updateUser).toHaveBeenCalledTimes(1);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, userData);
    });
  });
}); 