import { AuthService } from '../AuthService';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import { jwtDecode } from 'jwt-decode';

// Мокаем модули
jest.mock('axios');
jest.mock('jwt-decode');

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
})();

// Замещаем localStorage моком
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Мокаем window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('AuthService', () => {
  let authService: any;
  const TOKEN_KEY = 'auth_token'; // Используем ключ из реализации
  
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    localStorageMock.clear();
    window.location.href = '';
    
    // Сбрасываем синглтон
    // @ts-ignore - используем приватное свойство для теста
    AuthService.instance = undefined;
    
    authService = AuthService.getInstance();
  });
  
  it('should be a singleton', () => {
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  describe('login', () => {
    it('should store token and user data after successful login', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(axios.post).toHaveBeenCalledWith(`${API_CONFIG.baseUrl}/auth/login`, {
        email: 'test@example.com',
        password: 'password',
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error for failed login', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };

      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.login('test@example.com', 'wrong-password')).rejects.toEqual(mockError);
    });
  });
  
  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };
      
      const mockResponse = {
        data: { success: true }
      };
      
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      
      await authService.register(userData);
      
      expect(axios.post).toHaveBeenCalledWith(`${API_CONFIG.baseUrl}/auth/register`, userData);
    });
    
    it('should handle registration error', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      const mockError = {
        response: {
          status: 400,
          data: { message: 'User already exists' }
        }
      };
      
      (axios.post as jest.Mock).mockRejectedValue(mockError);
      
      await expect(authService.register(userData)).rejects.toEqual(mockError);
    });
  });
  
  describe('logout', () => {
    it('should remove token and redirect to login page', () => {
      // Устанавливаем токен в localStorage
      localStorageMock.setItem(TOKEN_KEY, 'test-token');
      
      // Вызываем logout
      authService.logout();
      
      // Проверяем, что токен удален
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
      
      // И произошел редирект
      expect(window.location.href).toBe('/login');
    });
  });
  
  describe('isAuthenticated', () => {
    it('should return true for valid token', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'valid-token');
      
      // Мокаем jwtDecode, чтобы возвращал валидный токен
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600, // +1 час от текущего времени
        sub: '1',
        role: 'USER'
      });
      
      // Проверяем результат
      expect(authService.isAuthenticated()).toBe(true);
    });
    
    it('should return false for expired token', () => {
      // Устанавливаем просроченный токен
      localStorageMock.setItem(TOKEN_KEY, 'expired-token');
      
      // Мокаем jwtDecode, чтобы возвращал просроченный токен
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) - 3600, // -1 час от текущего времени
        sub: '1',
        role: 'USER'
      });
      
      // Шпионим за методом logout
      const logoutSpy = jest.spyOn(authService, 'logout').mockImplementation(() => {});
      
      // Проверяем результат
      expect(authService.isAuthenticated()).toBe(false);
      
      // Проверяем, что logout был вызван
      expect(logoutSpy).toHaveBeenCalled();
      
      // Восстанавливаем оригинальную реализацию
      logoutSpy.mockRestore();
    });
    
    it('should return false when no token exists', () => {
      // Не устанавливаем токен
      expect(authService.isAuthenticated()).toBe(false);
    });
    
    it('should handle invalid token format', () => {
      // Устанавливаем неверный формат токена
      localStorageMock.setItem(TOKEN_KEY, 'invalid-format-token');
      
      // Мокаем jwtDecode, чтобы выбрасывал ошибку
      (jwtDecode as jest.Mock).mockImplementation(() => { 
        throw new Error('Invalid token');
      });
      
      // Шпионим за методом logout
      const logoutSpy = jest.spyOn(authService, 'logout').mockImplementation(() => {});
      
      // Проверяем результат
      expect(authService.isAuthenticated()).toBe(false);
      
      // Проверяем, что logout был вызван
      expect(logoutSpy).toHaveBeenCalled();
      
      // Восстанавливаем оригинальную реализацию
      logoutSpy.mockRestore();
    });
  });
  
  describe('getToken', () => {
    it('should return token when it exists in primary location', () => {
      localStorageMock.setItem(TOKEN_KEY, 'test-token');
      expect(authService.getToken()).toBe('test-token');
    });
    
    it('should return token from legacy location as fallback', () => {
      localStorageMock.setItem('token', 'legacy-token');
      expect(authService.getToken()).toBe('legacy-token');
    });
    
    it('should prefer primary location over legacy', () => {
      localStorageMock.setItem(TOKEN_KEY, 'primary-token');
      localStorageMock.setItem('token', 'legacy-token');
      expect(authService.getToken()).toBe('primary-token');
    });
    
    it('should return null when no token exists', () => {
      expect(authService.getToken()).toBeNull();
    });
  });
  
  describe('getCurrentUserRole', () => {
    it('should return role from token', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'valid-token');
      
      // Мокаем jwtDecode
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '1',
        role: 'ADMIN'
      });
      
      expect(authService.getCurrentUserRole()).toBe('ADMIN');
    });
    
    it('should return null when no token exists', () => {
      expect(authService.getCurrentUserRole()).toBeNull();
    });
    
    it('should handle decoding errors', () => {
      localStorageMock.setItem(TOKEN_KEY, 'invalid-token');
      
      // Мокаем jwtDecode, чтобы выбрасывал ошибку
      (jwtDecode as jest.Mock).mockImplementation(() => { 
        throw new Error('Invalid token');
      });
      
      expect(authService.getCurrentUserRole()).toBeNull();
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return user data from token', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'valid-token');
      
      // Мокаем jwtDecode
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '1',
        role: 'USER'
      });
      
      const user = authService.getCurrentUser();
      
      expect(user).toEqual({
        id: '1',
        username: '', // Эти поля пустые согласно реализации
        email: '',    // Эти поля пустые согласно реализации
        role: 'USER'
      });
    });
    
    it('should throw error when no token exists', () => {
      expect(() => authService.getCurrentUser()).toThrow('No authenticated user');
    });
    
    it('should throw error for invalid token', () => {
      localStorageMock.setItem(TOKEN_KEY, 'invalid-token');
      
      // Мокаем jwtDecode, чтобы выбрасывал ошибку
      (jwtDecode as jest.Mock).mockImplementation(() => { 
        throw new Error('Invalid token format');
      });
      
      expect(() => authService.getCurrentUser()).toThrow('Invalid token');
    });
  });
  
  describe('hasRole', () => {
    it('should return true when user has matching role', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'valid-token');
      
      // Мокаем jwtDecode и isAuthenticated
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '1',
        role: 'ADMIN'
      });
      
      jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
      
      expect(authService.hasRole('ADMIN')).toBe(true);
    });
    
    it('should return false when user has different role', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'valid-token');
      
      // Мокаем jwtDecode и isAuthenticated
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '1',
        role: 'USER'
      });
      
      jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
      
      expect(authService.hasRole('ADMIN')).toBe(false);
    });
    
    it('should return false when not authenticated', () => {
      jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
      expect(authService.hasRole('ADMIN')).toBe(false);
    });
  });
}); 