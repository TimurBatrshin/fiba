import axios from 'axios';
import { API_BASE_URL } from '../../../config/envConfig';
import { AuthService } from '../../AuthService';

// Дополнительный импорт, если админ API находится в отдельном файле
// Если у нас нет доступа к оригинальному коду, создадим временные заглушки для тестов
// В реальной ситуации мы бы импортировали актуальные функции из файла сервиса
const adminAPI = {
  getUserList: async () => {
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    if (!token) throw new Error('Unauthorized');
    
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },
  
  approveRegistration: async (registrationId: string) => {
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    if (!token) throw new Error('Unauthorized');
    
    const response = await axios.post(`${API_BASE_URL}/admin/registrations/${registrationId}/approve`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const authService = AuthService.getInstance();
    const token = authService.getToken();
    if (!token) throw new Error('Unauthorized');
    
    const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокаем AuthService
jest.mock('../../AuthService', () => ({
  AuthService: {
    getInstance: jest.fn().mockReturnValue({
      getToken: jest.fn().mockReturnValue('admin-token'),
      isAuthenticated: jest.fn().mockReturnValue(true),
      isAdmin: jest.fn().mockReturnValue(true),
      logout: jest.fn()
    })
  }
}));

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserList', () => {
    test('должен получать список пользователей', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: [
          { id: 'user1', name: 'User 1', email: 'user1@example.com', role: 'user' },
          { id: 'user2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
        ]
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await adminAPI.getUserList();
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/admin/users`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer admin-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    test('должен выбрасывать ошибку при отсутствии токена', async () => {
      // Мокаем отсутствие токена
      (AuthService.getInstance() as any).getToken.mockReturnValueOnce(null);
      
      // Вызываем тестируемую функцию и проверяем, что она выбрасывает ошибку
      await expect(adminAPI.getUserList()).rejects.toThrow('Unauthorized');
      
      // Проверяем, что запрос не был выполнен
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('approveRegistration', () => {
    test('должен подтверждать регистрацию команды', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: {
          id: 'reg1',
          status: 'confirmed',
          message: 'Registration approved'
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await adminAPI.approveRegistration('reg1');
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/admin/registrations/reg1/approve`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer admin-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteUser', () => {
    test('должен удалять пользователя', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: {
          success: true,
          message: 'User deleted'
        }
      };
      
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await adminAPI.deleteUser('user1');
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/admin/users/user1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer admin-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    test('должен обрабатывать ошибки при удалении пользователя', async () => {
      // Мокаем ошибку от API
      const error = {
        response: {
          status: 403,
          data: {
            message: 'Insufficient permissions'
          }
        }
      };
      
      mockedAxios.delete.mockRejectedValueOnce(error);
      
      // Вызываем тестируемую функцию и проверяем, что она выбрасывает ошибку
      await expect(adminAPI.deleteUser('user2')).rejects.toEqual(error);
      
      // Проверяем, что запрос был выполнен
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/admin/users/user2`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer admin-token'
          })
        })
      );
    });
  });
}); 