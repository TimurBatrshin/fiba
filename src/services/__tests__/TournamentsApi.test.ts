import axios from 'axios';
import { 
  getTournamentById, 
  createBusinessTournament, 
  getAdvertisement, 
  searchPlayers, 
  registerTeam,
  updateMatchScore,
  TournamentData
} from '../api/tournaments';
import { AuthService } from '../AuthService';

// Мокаем модули
jest.mock('axios');
jest.mock('../AuthService');

// Мокируем API_BASE_URL
jest.mock('../../config/envConfig', () => ({
  API_BASE_URL: 'https://api.example.com',
  APP_SETTINGS: {
    tokenStorageKey: 'fiba_auth_token'
  }
}));

describe('Tournaments API', () => {
  const mockToken = 'mock-token';
  const mockAuthServiceInstance = {
    getToken: jest.fn(() => mockToken),
    isAuthenticated: jest.fn(() => true),
    logout: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Настраиваем мок для AuthService
    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthServiceInstance);
  });

  describe('getTournamentById', () => {
    const tournamentId = '123';
    const mockTournamentResponse = {
      data: {
        id: tournamentId,
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
            tournament_id: tournamentId,
            user_id: 'user1',
            captain_id: 'player1',
            captain_name: 'Captain',
            players: [
              { id: 'player1', name: 'Player 1', is_captain: true },
              { id: 'player2', name: 'Player 2' }
            ]
          }
        ]
      }
    };

    it('should fetch a tournament by id', async () => {
      // Мокируем ответ axios
      (axios.get as jest.Mock).mockResolvedValueOnce(mockTournamentResponse);

      // Вызываем функцию
      const result = await getTournamentById(tournamentId);

      // Проверяем, что axios.get был вызван с правильными параметрами
      expect(axios.get).toHaveBeenCalledWith(
        `https://api.example.com/tournaments/${tournamentId}`,
        { headers: { 'Authorization': `Bearer ${mockToken}` } }
      );

      // Проверяем результат
      expect(result).toEqual({
        id: tournamentId,
        name: 'Test Tournament',
        title: 'Test Tournament',
        date: '2023-08-15',
        location: 'Test Location',
        level: 'Professional',
        prize_pool: 10000,
        status: 'registration',
        description: 'Test description',
        Registrations: expect.any(Array),
        sponsor_name: '',
        sponsor_logo: '',
        business_type: ''
      });
      
      // Проверяем правильную обработку регистраций
      expect(result.Registrations.length).toBe(1);
      expect(result.Registrations[0].players.length).toBe(2);
      expect(result.Registrations[0].players[0].is_captain).toBe(true);
    });

    it('should handle missing fields and provide defaults', async () => {
      // Мокируем ответ с минимальными данными
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          id: tournamentId
        }
      });

      // Вызываем функцию
      const result = await getTournamentById(tournamentId);

      // Проверяем результат
      expect(result).toEqual({
        id: tournamentId,
        name: 'Турнир без названия',
        title: 'Турнир без названия',
        date: expect.any(String),
        location: 'Не указано',
        level: 'Любительский',
        prize_pool: 0,
        status: 'registration',
        description: 'Описание отсутствует',
        Registrations: [],
        sponsor_name: '',
        sponsor_logo: '',
        business_type: ''
      });
    });

    it('should handle API error and redirect if unauthorized', async () => {
      // Мокируем ошибку авторизации
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(getTournamentById(tournamentId)).rejects.toEqual(mockError);

      // Проверяем, что был вызван logout при 401 ошибке
      expect(mockAuthServiceInstance.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthServiceInstance.logout).toHaveBeenCalled();
    });

    it('should handle general API error', async () => {
      // Мокируем общую ошибку
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(getTournamentById(tournamentId)).rejects.toEqual(mockError);

      // Проверяем, что logout не был вызван для не-401 ошибок
      expect(mockAuthServiceInstance.logout).not.toHaveBeenCalled();
    });
  });

  describe('createBusinessTournament', () => {
    const mockTournamentData = {
      title: 'Business Tournament',
      date: '2023-09-20',
      location: 'Business Location',
      level: 'Professional',
      prize_pool: 5000,
      sponsor_name: 'Sponsor Corp',
      sponsor_logo: 'logo.png',
      business_type: 'Corporate'
    };

    const mockResponse = {
      data: {
        id: 'new-tournament-id',
        ...mockTournamentData
      }
    };

    beforeEach(() => {
      // Мокируем localStorage для createBusinessTournament
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => mockToken)
        },
        writable: true
      });
    });

    it('should create a business tournament', async () => {
      // Мокируем успешный ответ
      (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await createBusinessTournament(mockTournamentData);

      // Проверяем, что axios.post был вызван правильно
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.example.com/tournaments/business',
        mockTournamentData,
        {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        }
      );

      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if not authenticated', async () => {
      // Мокируем отсутствие токена
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      // Вызываем функцию и ожидаем ошибку
      await expect(createBusinessTournament(mockTournamentData))
        .rejects.toThrow('Необходима авторизация');

      // Проверяем, что axios.post не был вызван
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      const mockError = new Error('API Error');
      // Мокируем ошибку API
      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(createBusinessTournament(mockTournamentData))
        .rejects.toEqual(mockError);
    });
  });

  describe('getAdvertisement', () => {
    const mockAdResponse = {
      data: {
        id: 'ad1',
        title: 'Test Advertisement',
        imageUrl: 'ad.jpg',
        linkUrl: 'https://example.com/ad',
        sponsor: 'Ad Sponsor'
      }
    };

    it('should fetch advertisement', async () => {
      // Мокируем успешный ответ
      (axios.get as jest.Mock).mockResolvedValueOnce(mockAdResponse);

      // Вызываем функцию
      const result = await getAdvertisement();

      // Проверяем, что axios.get был вызван правильно
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.example.com/ads/public/advertisement',
        { headers: { 'Authorization': `Bearer ${mockToken}` } }
      );

      // Проверяем результат
      expect(result).toEqual(mockAdResponse.data);
    });

    it('should return null if API fails', async () => {
      // Мокируем общую ошибку
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию
      const result = await getAdvertisement();

      // Проверяем результат
      expect(result).toBeNull();
    });

    it('should logout if unauthorized', async () => {
      // Мокируем ошибку авторизации
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию
      await getAdvertisement();

      // Проверяем, что был вызван logout при 401 ошибке
      expect(mockAuthServiceInstance.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthServiceInstance.logout).toHaveBeenCalled();
    });
  });

  describe('searchPlayers', () => {
    const searchQuery = 'test';
    const mockPlayersResponse = {
      data: [
        { id: 1, name: 'Test Player 1', email: 'player1@example.com' },
        { id: 2, name: 'Test Player 2', email: 'player2@example.com', photoUrl: 'photo2.jpg' }
      ]
    };

    it('should search for players', async () => {
      // Мокируем успешный ответ
      (axios.get as jest.Mock).mockResolvedValueOnce(mockPlayersResponse);

      // Вызываем функцию
      const result = await searchPlayers(searchQuery);

      // Проверяем, что axios.get был вызван правильно
      expect(axios.get).toHaveBeenCalledWith(
        `https://api.example.com/users/search?query=${searchQuery}`,
        { headers: { 'Authorization': `Bearer ${mockToken}` } }
      );

      // Проверяем результат
      expect(result).toEqual([
        { id: '1', name: 'Test Player 1', email: 'player1@example.com', photoUrl: null },
        { id: '2', name: 'Test Player 2', email: 'player2@example.com', photoUrl: 'photo2.jpg' }
      ]);
    });

    it('should return empty array on API error', async () => {
      // Мокируем общую ошибку
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию
      const result = await searchPlayers(searchQuery);

      // Проверяем результат
      expect(result).toEqual([]);
    });

    it('should logout if unauthorized', async () => {
      // Мокируем ошибку авторизации
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию
      await searchPlayers(searchQuery);

      // Проверяем, что был вызван logout при 401 ошибке
      expect(mockAuthServiceInstance.logout).toHaveBeenCalled();
    });
  });

  describe('registerTeam', () => {
    const tournamentId = '123';
    const teamName = 'Test Team';
    const playerIds = ['player1', 'player2', 'player3'];
    const mockResponse = {
      data: {
        id: 'reg1',
        teamName,
        status: 'pending',
        tournamentId,
        players: playerIds.map(id => ({ id }))
      },
      status: 200
    };

    it('should register a team successfully', async () => {
      // Мокируем успешный ответ
      (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await registerTeam(tournamentId, teamName, playerIds);

      // Проверяем, что axios.post был вызван правильно
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.example.com/tournaments/${tournamentId}/register`,
        { teamName, playerIds },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Проверяем результат
      expect(result).toEqual(mockResponse);
    });

    it('should throw error if not authenticated', async () => {
      // Мокируем неавторизованного пользователя
      mockAuthServiceInstance.isAuthenticated.mockReturnValueOnce(false);

      // Вызываем функцию и ожидаем ошибку
      await expect(registerTeam(tournamentId, teamName, playerIds))
        .rejects.toThrow('Необходима авторизация');

      // Проверяем, что axios.post не был вызван
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should throw error if token is missing', async () => {
      // Пользователь авторизован, но токен отсутствует
      mockAuthServiceInstance.isAuthenticated.mockReturnValueOnce(true);
      mockAuthServiceInstance.getToken.mockReturnValueOnce(null);

      // Вызываем функцию и ожидаем ошибку
      await expect(registerTeam(tournamentId, teamName, playerIds))
        .rejects.toThrow('Необходима авторизация');

      // Проверяем, что axios.post не был вызван
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      // Мокируем ошибку API с деталями
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid team data' },
          headers: {}
        }
      };
      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(registerTeam(tournamentId, teamName, playerIds))
        .rejects.toEqual(mockError);
    });

    it('should logout if unauthorized', async () => {
      // Мокируем ошибку авторизации
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          headers: {}
        }
      };
      (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(registerTeam(tournamentId, teamName, playerIds))
        .rejects.toEqual(mockError);

      // Проверяем, что был вызван logout при 401 ошибке
      expect(mockAuthServiceInstance.logout).toHaveBeenCalled();
    });
  });

  describe('updateMatchScore', () => {
    const tournamentId = '123';
    const matchId = 'match1';
    const score1 = 21;
    const score2 = 15;
    const isCompleted = true;
    const mockResponse = {
      data: {
        id: matchId,
        tournamentId,
        score1,
        score2,
        isCompleted,
        updated: true
      }
    };

    it('should update match score successfully', async () => {
      // Мокируем успешный ответ
      (axios.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Вызываем функцию
      const result = await updateMatchScore(tournamentId, matchId, score1, score2, isCompleted);

      // Проверяем, что axios.put был вызван правильно
      expect(axios.put).toHaveBeenCalledWith(
        `https://api.example.com/tournaments/${tournamentId}/matches/${matchId}`,
        { score1, score2, isCompleted },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Проверяем результат
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if not authenticated', async () => {
      // Мокируем неавторизованного пользователя
      mockAuthServiceInstance.isAuthenticated.mockReturnValueOnce(false);

      // Вызываем функцию и ожидаем ошибку
      await expect(updateMatchScore(tournamentId, matchId, score1, score2))
        .rejects.toThrow('Необходима авторизация');

      // Проверяем, что axios.put не был вызван
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('should throw error if token is missing', async () => {
      // Пользователь авторизован, но токен отсутствует
      mockAuthServiceInstance.isAuthenticated.mockReturnValueOnce(true);
      mockAuthServiceInstance.getToken.mockReturnValueOnce(null);

      // Вызываем функцию и ожидаем ошибку
      await expect(updateMatchScore(tournamentId, matchId, score1, score2))
        .rejects.toThrow('Необходима авторизация');

      // Проверяем, что axios.put не был вызван
      expect(axios.put).not.toHaveBeenCalled();
    });

    it('should logout if unauthorized', async () => {
      // Мокируем ошибку авторизации
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      (axios.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Вызываем функцию и ожидаем ошибку
      await expect(updateMatchScore(tournamentId, matchId, score1, score2))
        .rejects.toEqual(mockError);

      // Проверяем, что был вызван logout при 401 ошибке
      expect(mockAuthServiceInstance.logout).toHaveBeenCalled();
    });
  });
}); 