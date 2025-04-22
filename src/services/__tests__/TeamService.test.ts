import TeamService from '../TeamService';
import apiService from '../ApiService';

// Мокируем ApiService
jest.mock('../ApiService', () => ({
  getAllTeams: jest.fn(),
  getTeamById: jest.fn(),
  searchTeamsByName: jest.fn(),
  getTopTeams: jest.fn(),
  getTournamentTeams: jest.fn()
}));

describe('TeamService', () => {
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('getAllTeams', () => {
    it('should call apiService.getAllTeams and return the result', async () => {
      // Arrange
      const mockTeams = [
        { id: '1', name: 'Team A', logo: 'logoA.png', captain: 'Player1', members: ['Player1', 'Player2'], wins: 5, losses: 2, rank: 1 },
        { id: '2', name: 'Team B', logo: 'logoB.png', captain: 'Player3', members: ['Player3', 'Player4'], wins: 3, losses: 4, rank: 2 }
      ];
      (apiService.getAllTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.getAllTeams();

      // Assert
      expect(apiService.getAllTeams).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTeams);
    });

    it('should propagate errors from apiService.getAllTeams', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (apiService.getAllTeams as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TeamService.getAllTeams()).rejects.toThrow('Network error');
      expect(apiService.getAllTeams).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTeamById', () => {
    it('should call apiService.getTeamById with the correct ID and return the result', async () => {
      // Arrange
      const teamId = '123';
      const mockTeam = { 
        id: teamId, 
        name: 'Team C', 
        logo: 'logoC.png', 
        captain: 'Player5', 
        members: ['Player5', 'Player6'], 
        wins: 7, 
        losses: 1, 
        rank: 3 
      };
      (apiService.getTeamById as jest.Mock).mockResolvedValue(mockTeam);

      // Act
      const result = await TeamService.getTeamById(teamId);

      // Assert
      expect(apiService.getTeamById).toHaveBeenCalledTimes(1);
      expect(apiService.getTeamById).toHaveBeenCalledWith(teamId);
      expect(result).toEqual(mockTeam);
    });

    it('should propagate errors from apiService.getTeamById', async () => {
      // Arrange
      const teamId = '456';
      const mockError = new Error('Team not found');
      (apiService.getTeamById as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TeamService.getTeamById(teamId)).rejects.toThrow('Team not found');
      expect(apiService.getTeamById).toHaveBeenCalledTimes(1);
      expect(apiService.getTeamById).toHaveBeenCalledWith(teamId);
    });
  });

  describe('searchTeamsByName', () => {
    it('should call apiService.searchTeamsByName with the correct name and return the result', async () => {
      // Arrange
      const teamName = 'Warriors';
      const mockTeams = [
        { id: '7', name: 'Warriors Gold', logo: 'logoW.png', captain: 'Player10', members: ['Player10', 'Player11'], wins: 12, losses: 3, rank: 5 },
        { id: '8', name: 'Night Warriors', logo: 'logoNW.png', captain: 'Player12', members: ['Player12', 'Player13'], wins: 9, losses: 5, rank: 7 }
      ];
      (apiService.searchTeamsByName as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.searchTeamsByName(teamName);

      // Assert
      expect(apiService.searchTeamsByName).toHaveBeenCalledTimes(1);
      expect(apiService.searchTeamsByName).toHaveBeenCalledWith(teamName);
      expect(result).toEqual(mockTeams);
    });

    it('should propagate errors from apiService.searchTeamsByName', async () => {
      // Arrange
      const teamName = 'Unknown';
      const mockError = new Error('Search failed');
      (apiService.searchTeamsByName as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TeamService.searchTeamsByName(teamName)).rejects.toThrow('Search failed');
      expect(apiService.searchTeamsByName).toHaveBeenCalledTimes(1);
      expect(apiService.searchTeamsByName).toHaveBeenCalledWith(teamName);
    });
  });

  describe('getTopTeams', () => {
    it('should call apiService.getTopTeams with the correct limit and return the result', async () => {
      // Arrange
      const limit = 5;
      const mockTeams = [
        { id: '1', name: 'Team A', logo: 'logoA.png', captain: 'Player1', members: ['Player1', 'Player2'], wins: 15, losses: 2, rank: 1 },
        { id: '3', name: 'Team C', logo: 'logoC.png', captain: 'Player5', members: ['Player5', 'Player6'], wins: 14, losses: 3, rank: 2 }
      ];
      (apiService.getTopTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.getTopTeams(limit);

      // Assert
      expect(apiService.getTopTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTopTeams).toHaveBeenCalledWith(limit);
      expect(result).toEqual(mockTeams);
    });

    it('should use default limit when no limit is provided', async () => {
      // Arrange
      const mockTeams = [
        { id: '1', name: 'Team A', logo: 'logoA.png', captain: 'Player1', members: ['Player1', 'Player2'], wins: 15, losses: 2, rank: 1 }
      ];
      (apiService.getTopTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.getTopTeams();

      // Assert
      expect(apiService.getTopTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTopTeams).toHaveBeenCalledWith(10); // Default limit is 10
      expect(result).toEqual(mockTeams);
    });
  });

  describe('getTournamentTeams', () => {
    it('should call apiService.getTournamentTeams with the correct parameters', async () => {
      // Arrange
      const tournamentId = 'tournament-123';
      const status = 'APPROVED';
      const mockTeams = [
        { id: '9', name: 'Team D', logo: 'logoD.png', captain: 'Player20', members: ['Player20', 'Player21'] },
        { id: '10', name: 'Team E', logo: 'logoE.png', captain: 'Player22', members: ['Player22', 'Player23'] }
      ];
      (apiService.getTournamentTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.getTournamentTeams(tournamentId, status);

      // Assert
      expect(apiService.getTournamentTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentTeams).toHaveBeenCalledWith(tournamentId, status);
      expect(result).toEqual(mockTeams);
    });

    it('should work without status parameter', async () => {
      // Arrange
      const tournamentId = 'tournament-456';
      const mockTeams = [
        { id: '11', name: 'Team F', logo: 'logoF.png', captain: 'Player24', members: ['Player24', 'Player25'] }
      ];
      (apiService.getTournamentTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TeamService.getTournamentTeams(tournamentId);

      // Assert
      expect(apiService.getTournamentTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentTeams).toHaveBeenCalledWith(tournamentId, undefined);
      expect(result).toEqual(mockTeams);
    });

    it('should propagate errors from apiService.getTournamentTeams', async () => {
      // Arrange
      const tournamentId = 'invalid-id';
      const mockError = new Error('Tournament not found');
      (apiService.getTournamentTeams as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TeamService.getTournamentTeams(tournamentId)).rejects.toThrow('Tournament not found');
      expect(apiService.getTournamentTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentTeams).toHaveBeenCalledWith(tournamentId, undefined);
    });
  });
}); 