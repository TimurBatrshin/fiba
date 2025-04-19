// Общие моки данных для использования в тестах
module.exports = {
  // Мок пользователя
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  },
  
  // Мок администратора
  admin: {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN'
  },
  
  // Мок турнира
  tournament: {
    id: 1,
    name: 'Test Tournament',
    startDate: '2023-10-15',
    endDate: '2023-10-16',
    location: 'Test Location',
    status: 'ACTIVE',
    description: 'Test tournament description',
    teams: [
      { id: 1, name: 'Team A' },
      { id: 2, name: 'Team B' },
      { id: 3, name: 'Team C' },
      { id: 4, name: 'Team D' }
    ]
  },
  
  // Мок списка турниров
  tournaments: [
    {
      id: 1,
      name: 'Tournament 1',
      startDate: '2023-10-15',
      endDate: '2023-10-16',
      location: 'Location 1',
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Tournament 2',
      startDate: '2023-11-10',
      endDate: '2023-11-12',
      location: 'Location 2',
      status: 'UPCOMING'
    },
    {
      id: 3,
      name: 'Tournament 3',
      startDate: '2023-09-05',
      endDate: '2023-09-06',
      location: 'Location 3',
      status: 'COMPLETED'
    }
  ],
  
  // Мок игроков
  players: [
    { 
      id: 1, 
      name: 'Player One', 
      team: 'Team A',
      points: 125,
      gamesPlayed: 10
    },
    { 
      id: 2, 
      name: 'Player Two', 
      team: 'Team A',
      points: 118,
      gamesPlayed: 9
    },
    { 
      id: 3, 
      name: 'Player Three', 
      team: 'Team B',
      points: 150,
      gamesPlayed: 12
    }
  ],
  
  // Мок матчей
  matches: [
    {
      id: 1,
      tournamentId: 1,
      teamA: 'Team A',
      teamB: 'Team B',
      scoreA: 21,
      scoreB: 15,
      date: '2023-10-15T10:00:00',
      status: 'COMPLETED'
    },
    {
      id: 2,
      tournamentId: 1,
      teamA: 'Team C',
      teamB: 'Team D',
      scoreA: 18,
      scoreB: 21,
      date: '2023-10-15T11:30:00',
      status: 'COMPLETED'
    },
    {
      id: 3,
      tournamentId: 1,
      teamA: 'Team A',
      teamB: 'Team D',
      scoreA: 0,
      scoreB: 0,
      date: '2023-10-16T10:00:00',
      status: 'SCHEDULED'
    }
  ]
}; 