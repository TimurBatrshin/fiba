import axios from 'axios';
import { 
  getTournamentById, 
  registerTeam,
  searchPlayers,
  getAdvertisement,
  TournamentData
} from '../tournaments';
import { AuthService } from '../../AuthService';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокаем AuthService
jest.mock('../../AuthService', () => ({
  AuthService: {
    getInstance: jest.fn().mockReturnValue({
      getToken: jest.fn().mockReturnValue('mock-token'),
      isAuthenticated: jest.fn().mockReturnValue(true),
      logout: jest.fn()
    })
  }
}));

describe('Tournaments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTournamentById', () => {
    test('должен правильно получать и нормализовать данные турнира', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: {
          id: '123',
          name: 'Test Tournament',
          date: '2023-08-15',
          location: 'Test Location',
          level: 'Professional',
          prize_pool: 10000,
          status: 'registration',
          description: 'Test description',
          Registrations: [
            {
              id: 'reg1',
              team_name: 'Team 1',
              status: 'confirmed',
              tournament_id: '123',
              user_id: 'user1',
              captain_id: 'player1',
              captain_name: 'Captain',
              players: [
                { id: 'player1', name: 'Player 1' },
                { id: 'player2', name: 'Player 2' }
              ]
            }
          ]
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await getTournamentById('123');
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tournaments/123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(expect.objectContaining({
        id: '123',
        name: 'Test Tournament',
        date: '2023-08-15',
        location: 'Test Location',
        level: 'Professional',
        prize_pool: 10000,
        status: 'registration',
        description: 'Test description',
        Registrations: expect.arrayContaining([
          expect.objectContaining({
            id: 'reg1',
            team_name: 'Team 1',
            status: 'confirmed',
            players: expect.arrayContaining([
              expect.objectContaining({ id: 'player1' })
            ])
          })
        ])
      }));
    });

    test('должен обрабатывать ошибку 401 и выполнять выход из системы', async () => {
      // Мокаем ошибку 401
      const error = {
        response: {
          status: 401
        }
      };
      
      mockedAxios.get.mockRejectedValueOnce(error);
      
      // Вызываем тестируемую функцию и проверяем, что она выбрасывает ошибку
      await expect(getTournamentById('123')).rejects.toEqual(error);
      
      // Проверяем, что был выполнен выход из системы
      expect(AuthService.getInstance().logout).toHaveBeenCalled();
    });
  });

  describe('registerTeam', () => {
    test('должен правильно регистрировать команду', async () => {
      // Мокаем успешный ответ
      const mockResponse = {
        data: {
          id: 'reg1',
          teamName: 'Test Team',
          status: 'pending',
          tournamentId: '123',
          players: [
            { id: 'player1' },
            { id: 'player2' },
            { id: 'player3' }
          ]
        },
        status: 200
      };
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await registerTeam('123', 'Test Team', ['player1', 'player2', 'player3']);
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/tournaments/123/register'),
        {
          teamName: 'Test Team',
          playerIds: ['player1', 'player2', 'player3']
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(mockResponse);
    });

    test('должен проверять авторизацию при регистрации команды', async () => {
      // Мокаем неавторизованного пользователя
      (AuthService.getInstance() as any).isAuthenticated.mockReturnValueOnce(false);
      
      // Вызываем тестируемую функцию и проверяем, что она выбрасывает ошибку
      await expect(registerTeam('123', 'Test Team', ['player1'])).rejects.toThrow('Необходима авторизация');
      
      // Проверяем, что запрос не был выполнен
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('searchPlayers', () => {
    test('должен правильно искать игроков', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: [
          { id: 1, name: 'Player 1', email: 'player1@example.com' },
          { id: 2, name: 'Player 2', email: 'player2@example.com' }
        ]
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await searchPlayers('player');
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/users/search?query=player'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual([
        { id: '1', name: 'Player 1', email: 'player1@example.com', photoUrl: null },
        { id: '2', name: 'Player 2', email: 'player2@example.com', photoUrl: null }
      ]);
    });
  });

  describe('getAdvertisement', () => {
    test('должен правильно получать рекламу', async () => {
      // Мокаем ответ от API
      const mockResponse = {
        data: {
          id: 'ad1',
          title: 'Test Ad',
          imageUrl: 'http://example.com/ad.jpg',
          linkUrl: 'http://example.com/promo'
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      // Вызываем тестируемую функцию
      const result = await getAdvertisement();
      
      // Проверяем, что запрос был выполнен правильно
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ads/public/advertisement'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      
      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    test('должен возвращать null при ошибке получения рекламы', async () => {
      // Мокаем ошибку
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      // Вызываем тестируемую функцию
      const result = await getAdvertisement();
      
      // Проверяем результат
      expect(result).toBeNull();
    });
  });
}); 