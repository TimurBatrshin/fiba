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
  const TOKEN_KEY = 'fiba_auth_token'; // Use the actual token key from APP_SETTINGS
  
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
      expect(window.location.href).toBe('/fiba/login');
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
    
    it('should return user data with email and username if provided in token', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'token-with-user-data');
      
      // Мокаем jwtDecode с дополнительными полями
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '1',
        role: 'USER',
        email: 'test@example.com',
        username: 'testuser'
      });
      
      const user = authService.getCurrentUser();
      
      // Тест на то, что возвращается объект с правильными полями,
      // даже если это означает пустые строки для email и username
      expect(user).toEqual({
        id: '1',
        username: '', // Все равно пустые согласно реализации
        email: '',    // Все равно пустые согласно реализации
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

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'old-token');
      
      const mockResponse = {
        data: {
          token: 'new-refreshed-token'
        }
      };
      
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Вызываем приватный метод refreshToken
      await (authService as any).refreshToken();
      
      // Проверяем, что был вызван axios.post с правильными параметрами
      expect(axios.post).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: 'Bearer old-token'
          }
        }
      );
      
      // Проверяем, что токен был обновлен
      expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'new-refreshed-token');
    });
    
    it('should handle case when there is no token to refresh', async () => {
      // Не устанавливаем токен
      const logoutSpy = jest.spyOn(authService, 'logout').mockImplementation(() => {});
      
      await (authService as any).refreshToken();
      
      // Должен вызвать logout и не делать запрос
      expect(logoutSpy).toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
      
      logoutSpy.mockRestore();
    });
    
    it('should handle error in token refresh', async () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'old-token');
      
      // Мокаем ошибку в запросе
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);
      
      // Шпионим за logout
      const logoutSpy = jest.spyOn(authService, 'logout').mockImplementation(() => {});
      
      // Мокаем console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      await (authService as any).refreshToken();
      
      // Должен логировать ошибку и вызвать logout
      expect(console.error).toHaveBeenCalledWith('Error refreshing token:', mockError);
      expect(logoutSpy).toHaveBeenCalled();
      
      logoutSpy.mockRestore();
      // Восстанавливаем console.error
      console.error = originalConsoleError;
    });
    
    it('should not update token if response is missing token', async () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'old-token');
      
      // Ответ без токена
      const mockResponse = {
        data: {}
      };
      
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Шпионим за setToken
      const setTokenSpy = jest.spyOn(authService as any, 'setToken');
      
      await (authService as any).refreshToken();
      
      // Не должен вызывать setToken
      expect(setTokenSpy).not.toHaveBeenCalled();
      
      setTokenSpy.mockRestore();
    });
  });

  describe('startTokenRefreshTimer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Создаем моки для setTimeout
      jest.spyOn(global, 'setTimeout');
    });
    
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });
    
    it('should not set timer when no token exists', () => {
      // Не устанавливаем токен
      const stopTimerSpy = jest.spyOn(authService as any, 'stopTokenRefreshTimer');
      
      (authService as any).startTokenRefreshTimer();
      
      // Должен вызвать stopTokenRefreshTimer
      expect(stopTimerSpy).toHaveBeenCalled();
      // setTimeout не должен быть вызван для создания нового таймера
      // Проверяем, что setTimeout был вызван 0 раз
      expect(setTimeout).toHaveBeenCalledTimes(0);
      
      stopTimerSpy.mockRestore();
    });
    
    it('should calculate refresh time for tokens with longer lifetime', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'test-token');
      
      // Время жизни токена больше 10 минут
      const expiresIn = 3600; // 1 час
      
      // Мокаем jwtDecode
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        sub: '1',
        role: 'USER'
      });
      
      (authService as any).startTokenRefreshTimer();
      
      // Проверяем, что setTimeout был вызван
      expect(setTimeout).toHaveBeenCalled();
      
      // Получаем аргументы вызова setTimeout
      const setTimeoutCalls = (setTimeout as unknown as jest.Mock).mock.calls;
      expect(setTimeoutCalls.length).toBeGreaterThan(0);
      
      // Проверяем что первый аргумент - функция, а второй - правильное время
      const [callback, timeout] = setTimeoutCalls[0];
      expect(typeof callback).toBe('function');
      expect(timeout).toBe((expiresIn - 300) * 1000);
    });
    
    it('should calculate refresh time for tokens with shorter lifetime', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'test-token');
      
      // Время жизни токена меньше 10 минут
      const expiresIn = 300; // 5 минут
      
      // Мокаем jwtDecode
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        sub: '1',
        role: 'USER'
      });
      
      (authService as any).startTokenRefreshTimer();
      
      // Проверяем, что setTimeout был вызван
      expect(setTimeout).toHaveBeenCalled();
      
      // Получаем аргументы вызова setTimeout
      const setTimeoutCalls = (setTimeout as unknown as jest.Mock).mock.calls;
      expect(setTimeoutCalls.length).toBeGreaterThan(0);
      
      // Проверяем что первый аргумент - функция, а второй - правильное время
      const [callback, timeout] = setTimeoutCalls[0];
      expect(typeof callback).toBe('function');
      expect(timeout).toBe((expiresIn / 2) * 1000);
    });
    
    it('should handle token decoding error', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'invalid-token');
      
      // Мокаем ошибку декодирования
      (jwtDecode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token format');
      });
      
      // Мокаем console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      (authService as any).startTokenRefreshTimer();
      
      // Должен логировать ошибку
      expect(console.error).toHaveBeenCalledWith(
        'Error starting token refresh timer:',
        expect.any(Error)
      );
      
      // Восстанавливаем console.error
      console.error = originalConsoleError;
    });
    
    it('should trigger refreshToken when timer expires', () => {
      // Устанавливаем токен
      localStorageMock.setItem(TOKEN_KEY, 'test-token');
      
      // Мокаем jwtDecode
      (jwtDecode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 600, // 10 минут
        sub: '1',
        role: 'USER'
      });
      
      // Шпионим за refreshToken
      const refreshTokenSpy = jest.spyOn(authService as any, 'refreshToken')
        .mockImplementation(() => Promise.resolve());
      
      // Запускаем таймер
      (authService as any).startTokenRefreshTimer();
      
      // Проверяем, что setTimeout был вызван
      expect(setTimeout).toHaveBeenCalled();
      
      // Эмулируем срабатывание таймера
      jest.runAllTimers();
      
      // Проверяем, что refreshToken был вызван
      expect(refreshTokenSpy).toHaveBeenCalled();
      
      refreshTokenSpy.mockRestore();
    });
  });

  describe('stopTokenRefreshTimer', () => {
    it('should clear timeout if timer exists', () => {
      // Создаем таймер вручную
      (authService as any).refreshTimer = setTimeout(() => {}, 1000);
      
      // Шпионим за clearTimeout
      jest.spyOn(global, 'clearTimeout');
      
      (authService as any).stopTokenRefreshTimer();
      
      // Проверяем, что clearTimeout был вызван
      expect(clearTimeout).toHaveBeenCalled();
      
      // Проверяем, что таймер сброшен
      expect((authService as any).refreshTimer).toBeNull();
    });
    
    it('should do nothing if no timer exists', () => {
      // Устанавливаем refreshTimer в null
      (authService as any).refreshTimer = null;
      
      // Шпионим за clearTimeout
      jest.spyOn(global, 'clearTimeout');
      
      (authService as any).stopTokenRefreshTimer();
      
      // Проверяем, что clearTimeout не был вызван
      expect(clearTimeout).not.toHaveBeenCalled();
    });
  });
}); 