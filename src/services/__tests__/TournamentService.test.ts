import TournamentService, { Tournament, TournamentCreateInput, TeamStatusUpdate } from '../TournamentService';
import apiService from '../ApiService';

// Мокируем ApiService
jest.mock('../ApiService', () => ({
  getAllTournaments: jest.fn(),
  getTournamentById: jest.fn(),
  getUpcomingTournaments: jest.fn(),
  getCompletedTournaments: jest.fn(),
  searchTournamentsByLocation: jest.fn(),
  getBusinessTournaments: jest.fn(),
  createTournament: jest.fn(),
  updateTeamStatus: jest.fn(),
  getTournamentTeams: jest.fn()
}));

describe('TournamentService', () => {
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('getAllTournaments', () => {
    it('should call apiService.getAllTournaments and return the result', async () => {
      // Arrange
      const mockTournaments: Tournament[] = [
        {
          id: '1',
          name: 'Summer Tournament 2023',
          date: '2023-07-15',
          location: 'City Stadium',
          description: 'Annual summer tournament',
          status: 'PLANNED',
          maxTeams: 16,
          currentTeams: 8,
          entryFee: 200,
          prizePool: 5000,
          sponsors: ['SponsorA', 'SponsorB'],
          rules: 'Standard rules apply',
          createdAt: '2023-05-01T12:00:00Z',
          updatedAt: '2023-05-10T15:30:00Z'
        },
        {
          id: '2',
          name: 'Winter Cup 2023',
          date: '2023-12-10',
          location: 'Indoor Arena',
          description: 'Winter championship',
          status: 'PLANNED',
          maxTeams: 24,
          currentTeams: 4,
          entryFee: 250,
          prizePool: 8000,
          sponsors: ['SponsorC'],
          rules: 'Modified rules for indoor play',
          createdAt: '2023-09-15T10:00:00Z',
          updatedAt: '2023-09-20T14:45:00Z'
        }
      ];
      (apiService.getAllTournaments as jest.Mock).mockResolvedValue(mockTournaments);

      // Act
      const result = await TournamentService.getAllTournaments();

      // Assert
      expect(apiService.getAllTournaments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTournaments);
    });

    it('should propagate errors from apiService.getAllTournaments', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch tournaments');
      (apiService.getAllTournaments as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TournamentService.getAllTournaments()).rejects.toThrow('Failed to fetch tournaments');
      expect(apiService.getAllTournaments).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTournamentById', () => {
    it('should call apiService.getTournamentById with the correct ID and return the result', async () => {
      // Arrange
      const tournamentId = '123';
      const mockTournament: Tournament = {
        id: tournamentId,
        name: 'Championship Finals',
        date: '2023-08-20',
        location: 'Main Stadium',
        description: 'Final championship tournament',
        status: 'PLANNED',
        maxTeams: 8,
        currentTeams: 8,
        entryFee: 500,
        prizePool: 15000,
        sponsors: ['MajorSponsor'],
        rules: 'Official rules apply',
        createdAt: '2023-06-01T09:00:00Z',
        updatedAt: '2023-06-15T11:20:00Z'
      };
      (apiService.getTournamentById as jest.Mock).mockResolvedValue(mockTournament);

      // Act
      const result = await TournamentService.getTournamentById(tournamentId);

      // Assert
      expect(apiService.getTournamentById).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentById).toHaveBeenCalledWith(tournamentId);
      expect(result).toEqual(mockTournament);
    });

    it('should propagate errors from apiService.getTournamentById', async () => {
      // Arrange
      const tournamentId = '456';
      const mockError = new Error('Tournament not found');
      (apiService.getTournamentById as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TournamentService.getTournamentById(tournamentId)).rejects.toThrow('Tournament not found');
      expect(apiService.getTournamentById).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentById).toHaveBeenCalledWith(tournamentId);
    });
  });

  describe('getUpcomingTournaments', () => {
    it('should call apiService.getUpcomingTournaments and return the result', async () => {
      // Arrange
      const mockTournaments: Tournament[] = [
        {
          id: '3',
          name: 'Spring Tournament 2024',
          date: '2024-04-15',
          location: 'Community Courts',
          description: 'Spring season opener',
          status: 'PLANNED',
          maxTeams: 12,
          currentTeams: 0,
          entryFee: 150,
          prizePool: 3000,
          sponsors: ['LocalSponsor'],
          rules: 'Standard rules apply',
          createdAt: '2023-12-15T12:00:00Z',
          updatedAt: '2023-12-15T12:00:00Z'
        }
      ];
      (apiService.getUpcomingTournaments as jest.Mock).mockResolvedValue(mockTournaments);

      // Act
      const result = await TournamentService.getUpcomingTournaments();

      // Assert
      expect(apiService.getUpcomingTournaments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTournaments);
    });
  });

  describe('getCompletedTournaments', () => {
    it('should call apiService.getCompletedTournaments and return the result', async () => {
      // Arrange
      const mockTournaments: Tournament[] = [
        {
          id: '4',
          name: 'Summer Classic 2022',
          date: '2022-07-10',
          location: 'Central Park',
          description: 'Annual summer classic',
          status: 'COMPLETED',
          maxTeams: 16,
          currentTeams: 16,
          entryFee: 200,
          prizePool: 5000,
          sponsors: ['OldSponsor'],
          rules: 'Standard rules',
          createdAt: '2022-05-01T12:00:00Z',
          updatedAt: '2022-07-15T18:30:00Z'
        }
      ];
      (apiService.getCompletedTournaments as jest.Mock).mockResolvedValue(mockTournaments);

      // Act
      const result = await TournamentService.getCompletedTournaments();

      // Assert
      expect(apiService.getCompletedTournaments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTournaments);
    });
  });

  describe('searchTournamentsByLocation', () => {
    it('should call apiService.searchTournamentsByLocation with the correct location and return the result', async () => {
      // Arrange
      const location = 'New York';
      const mockTournaments: Tournament[] = [
        {
          id: '5',
          name: 'New York Classic',
          date: '2023-09-15',
          location: 'New York City Courts',
          description: 'NYC annual tournament',
          status: 'PLANNED',
          maxTeams: 20,
          currentTeams: 15,
          entryFee: 300,
          prizePool: 10000,
          sponsors: ['NYCSponsor'],
          rules: 'NYC modified rules',
          createdAt: '2023-05-20T12:00:00Z',
          updatedAt: '2023-06-10T15:45:00Z'
        }
      ];
      (apiService.searchTournamentsByLocation as jest.Mock).mockResolvedValue(mockTournaments);

      // Act
      const result = await TournamentService.searchTournamentsByLocation(location);

      // Assert
      expect(apiService.searchTournamentsByLocation).toHaveBeenCalledTimes(1);
      expect(apiService.searchTournamentsByLocation).toHaveBeenCalledWith(location);
      expect(result).toEqual(mockTournaments);
    });
  });

  describe('getBusinessTournaments', () => {
    it('should call apiService.getBusinessTournaments and return the result', async () => {
      // Arrange
      const mockTournaments: Tournament[] = [
        {
          id: '6',
          name: 'Corporate Challenge 2023',
          date: '2023-10-12',
          location: 'Business Park Arena',
          description: 'Annual corporate tournament',
          status: 'PLANNED',
          maxTeams: 32,
          currentTeams: 28,
          entryFee: 1000,
          prizePool: 50000,
          sponsors: ['CorporateSponsorA', 'CorporateSponsorB'],
          rules: 'Corporate league rules',
          createdAt: '2023-07-01T09:00:00Z',
          updatedAt: '2023-07-15T14:20:00Z'
        }
      ];
      (apiService.getBusinessTournaments as jest.Mock).mockResolvedValue(mockTournaments);

      // Act
      const result = await TournamentService.getBusinessTournaments();

      // Assert
      expect(apiService.getBusinessTournaments).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTournaments);
    });
  });

  describe('createTournament', () => {
    it('should call apiService.createTournament with the correct data and return the result', async () => {
      // Arrange
      const tournamentData: TournamentCreateInput = {
        name: 'New Tournament 2023',
        date: '2023-11-20',
        location: 'Sports Complex',
        description: 'Brand new tournament',
        status: 'PLANNED',
        maxTeams: 16,
        entryFee: 250,
        prizePool: 8000,
        sponsors: ['NewSponsor'],
        rules: 'Standard tournament rules'
      };
      
      const createdTournament: Tournament = {
        ...tournamentData,
        id: '7',
        currentTeams: 0,
        createdAt: '2023-08-15T10:00:00Z',
        updatedAt: '2023-08-15T10:00:00Z'
      };
      
      (apiService.createTournament as jest.Mock).mockResolvedValue(createdTournament);

      // Act
      const result = await TournamentService.createTournament(tournamentData);

      // Assert
      expect(apiService.createTournament).toHaveBeenCalledTimes(1);
      expect(apiService.createTournament).toHaveBeenCalledWith(tournamentData);
      expect(result).toEqual(createdTournament);
    });

    it('should propagate errors from apiService.createTournament', async () => {
      // Arrange
      const tournamentData: TournamentCreateInput = {
        name: 'Invalid Tournament',
        date: '2023-12-25',
        location: '',  // Invalid: empty location
        description: 'Test tournament',
        status: 'PLANNED',
        maxTeams: 16,
        entryFee: 200,
        prizePool: 5000,
        sponsors: [],
        rules: 'Standard rules'
      };
      
      const mockError = new Error('Validation failed: Location is required');
      (apiService.createTournament as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TournamentService.createTournament(tournamentData)).rejects.toThrow('Validation failed');
      expect(apiService.createTournament).toHaveBeenCalledTimes(1);
      expect(apiService.createTournament).toHaveBeenCalledWith(tournamentData);
    });
  });

  describe('updateTeamStatus', () => {
    it('should call apiService.updateTeamStatus with the correct parameters', async () => {
      // Arrange
      const statusUpdate: TeamStatusUpdate = {
        tournamentId: 'tournament-123',
        teamId: 'team-456',
        status: 'APPROVED'
      };
      
      const mockResponse = { success: true, message: 'Status updated successfully' };
      (apiService.updateTeamStatus as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await TournamentService.updateTeamStatus(statusUpdate);

      // Assert
      expect(apiService.updateTeamStatus).toHaveBeenCalledTimes(1);
      expect(apiService.updateTeamStatus).toHaveBeenCalledWith(
        statusUpdate.tournamentId,
        statusUpdate.teamId,
        statusUpdate.status
      );
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from apiService.updateTeamStatus', async () => {
      // Arrange
      const statusUpdate: TeamStatusUpdate = {
        tournamentId: 'invalid-tournament',
        teamId: 'team-456',
        status: 'APPROVED'
      };
      
      const mockError = new Error('Tournament not found');
      (apiService.updateTeamStatus as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(TournamentService.updateTeamStatus(statusUpdate)).rejects.toThrow('Tournament not found');
      expect(apiService.updateTeamStatus).toHaveBeenCalledTimes(1);
      expect(apiService.updateTeamStatus).toHaveBeenCalledWith(
        statusUpdate.tournamentId,
        statusUpdate.teamId,
        statusUpdate.status
      );
    });
  });

  describe('getTournamentTeams', () => {
    it('should call apiService.getTournamentTeams with the correct parameters', async () => {
      // Arrange
      const tournamentId = 'tournament-123';
      const status = 'APPROVED';
      const mockTeams = [
        { id: 'team-1', name: 'Team Alpha', players: ['Player1', 'Player2'] },
        { id: 'team-2', name: 'Team Beta', players: ['Player3', 'Player4'] }
      ];
      (apiService.getTournamentTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TournamentService.getTournamentTeams(tournamentId, status);

      // Assert
      expect(apiService.getTournamentTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentTeams).toHaveBeenCalledWith(tournamentId, status);
      expect(result).toEqual(mockTeams);
    });

    it('should work without status parameter', async () => {
      // Arrange
      const tournamentId = 'tournament-456';
      const mockTeams = [
        { id: 'team-3', name: 'Team Gamma', players: ['Player5', 'Player6'] },
        { id: 'team-4', name: 'Team Delta', players: ['Player7', 'Player8'] }
      ];
      (apiService.getTournamentTeams as jest.Mock).mockResolvedValue(mockTeams);

      // Act
      const result = await TournamentService.getTournamentTeams(tournamentId);

      // Assert
      expect(apiService.getTournamentTeams).toHaveBeenCalledTimes(1);
      expect(apiService.getTournamentTeams).toHaveBeenCalledWith(tournamentId, undefined);
      expect(result).toEqual(mockTeams);
    });
  });
}); 