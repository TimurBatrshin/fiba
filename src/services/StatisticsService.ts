import { PlayerBasicStats } from '../interfaces/PlayerStatistics';
import { API_BASE_URL } from './config';
import defaultAvatar from '../assets/images/default-avatar.png';

// Моковые данные для разработки
const MOCK_PLAYERS: PlayerBasicStats[] = [
  {
    id: 1,
    name: "Александр Иванов",
    teamName: "Moscow Stars",
    photoUrl: defaultAvatar,
    totalPoints: 456,
    rating: 94.2
  },
  {
    id: 2,
    name: "Михаил Петров",
    teamName: "Kazan Tigers",
    photoUrl: defaultAvatar,
    totalPoints: 445,
    rating: 92.7
  },
  {
    id: 3,
    name: "Дмитрий Сидоров",
    teamName: "St. Petersburg Knights",
    photoUrl: defaultAvatar,
    totalPoints: 432,
    rating: 91.5
  },
  {
    id: 4,
    name: "Игорь Смирнов",
    teamName: "Novosibirsk Wolves",
    photoUrl: defaultAvatar,
    totalPoints: 428,
    rating: 90.8
  },
  {
    id: 5,
    name: "Сергей Волков",
    teamName: "Ekaterinburg Eagles",
    photoUrl: defaultAvatar,
    totalPoints: 415,
    rating: 89.3
  },
  {
    id: 6,
    name: "Андрей Козлов",
    teamName: "Sochi Dolphins",
    photoUrl: defaultAvatar,
    totalPoints: 402,
    rating: 88.5
  },
  {
    id: 7,
    name: "Павел Соколов",
    teamName: "Krasnodar Lions",
    photoUrl: defaultAvatar,
    totalPoints: 395,
    rating: 87.6
  },
  {
    id: 8,
    name: "Николай Новиков",
    teamName: "Vladivostok Sharks",
    photoUrl: defaultAvatar,
    totalPoints: 389,
    rating: 86.9
  },
  {
    id: 9,
    name: "Алексей Морозов",
    teamName: "Samara Phoenix",
    photoUrl: defaultAvatar,
    totalPoints: 378,
    rating: 85.3
  },
  {
    id: 10,
    name: "Владимир Орлов",
    teamName: "Ufa Falcons",
    photoUrl: defaultAvatar,
    totalPoints: 365,
    rating: 83.7
  }
];

export class StatisticsService {
  private static instance: StatisticsService;
  private apiBaseUrl: string;
  private useMockData: boolean;

  private constructor() {
    this.apiBaseUrl = API_BASE_URL;
    
    // В режиме разработки или при отсутствии API используем моковые данные
    this.useMockData = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      !this.apiBaseUrl;
  }

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  public async getTopPlayers(category: 'points' | 'rating', limit: number = 10): Promise<PlayerBasicStats[]> {
    try {
      // Используем моковые данные в режиме разработки
      if (this.useMockData) {
        console.log(`Using mock data for top players (${category})`);
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Сортировка по соответствующей категории
        const sortedPlayers = [...MOCK_PLAYERS].sort((a, b) => {
          if (category === 'points') {
            return b.totalPoints - a.totalPoints;
          } else {
            return b.rating - a.rating;
          }
        });
        
        return sortedPlayers.slice(0, limit);
      }
      
      // Реальный API-запрос
      const response = await fetch(`${this.apiBaseUrl}/statistics/top-players?category=${category}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top players:', error);
      
      // В случае ошибки на продакшене возвращаем моковые данные
      if (!this.useMockData) {
        console.warn('Falling back to mock data due to API error');
        const sortedPlayers = [...MOCK_PLAYERS].sort((a, b) => {
          if (category === 'points') {
            return b.totalPoints - a.totalPoints;
          } else {
            return b.rating - a.rating;
          }
        });
        return sortedPlayers.slice(0, limit);
      }
      
      throw error;
    }
  }

  public async calculatePlayerRating(playerId: number): Promise<number> {
    try {
      if (this.useMockData) {
        console.log(`Using mock data for player rating (id: ${playerId})`);
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Поиск игрока по ID в моковых данных
        const player = MOCK_PLAYERS.find(p => p.id === playerId);
        if (player) {
          return player.rating;
        }
        return Math.floor(Math.random() * 30) + 70; // Случайное значение от 70 до 100
      }
      
      const response = await fetch(`${this.apiBaseUrl}/statistics/player/${playerId}/rating`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.rating;
    } catch (error) {
      console.error('Error calculating player rating:', error);
      
      if (!this.useMockData) {
        console.warn('Falling back to mock data due to API error');
        const player = MOCK_PLAYERS.find(p => p.id === playerId);
        if (player) {
          return player.rating;
        }
        return Math.floor(Math.random() * 30) + 70;
      }
      
      throw error;
    }
  }

  // Helper method for testing purposes
  public setMockDataMode(useMock: boolean): void {
    this.useMockData = useMock;
  }
} 