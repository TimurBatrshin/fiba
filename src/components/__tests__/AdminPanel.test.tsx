import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../AdminPanel';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  getAdminTournaments, 
  updateTournamentStatus 
} from '../../services/api/admin';

// Мокируем API функции
jest.mock('../../services/api/admin', () => ({
  getAdminStats: jest.fn(),
  getAdminUsers: jest.fn(),
  updateUserRole: jest.fn(),
  getAdminTournaments: jest.fn(),
  updateTournamentStatus: jest.fn()
}));

describe('AdminPanel Component', () => {
  const mockStats = {
    total_users: 150,
    total_tournaments: 42,
    active_tournaments: 10,
    pending_registrations: 24
  };
  
  const mockUsers = [
    { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      role: 'USER', 
      created_at: '2023-01-01T00:00:00.000Z' 
    },
    { 
      id: '2', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      role: 'ADMIN', 
      created_at: '2023-01-02T00:00:00.000Z' 
    }
  ];
  
  const mockTournaments = [
    { 
      id: '1', 
      title: 'Test Tournament', 
      date: '2023-06-15T00:00:00.000Z', 
      status: 'registration', 
      registrations_count: 10 
    },
    { 
      id: '2', 
      title: 'Active Tournament', 
      date: '2023-06-20T00:00:00.000Z', 
      status: 'in_progress', 
      registrations_count: 16 
    },
    { 
      id: '3', 
      title: 'Completed Tournament', 
      date: '2023-06-01T00:00:00.000Z', 
      status: 'completed', 
      registrations_count: 12 
    }
  ];
  
  beforeEach(() => {
    // Мокируем успешные ответы API по умолчанию
    (getAdminStats as jest.Mock).mockResolvedValue(mockStats);
    (getAdminUsers as jest.Mock).mockResolvedValue(mockUsers);
    (getAdminTournaments as jest.Mock).mockResolvedValue(mockTournaments);
    (updateUserRole as jest.Mock).mockResolvedValue({ success: true });
    (updateTournamentStatus as jest.Mock).mockResolvedValue({ success: true });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders loading state initially', () => {
    render(<AdminPanel />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('loads and displays dashboard statistics', async () => {
    render(<AdminPanel />);
    
    // Проверяем, что API вызывается для загрузки данных
    expect(getAdminStats).toHaveBeenCalled();
    expect(getAdminUsers).toHaveBeenCalled();
    expect(getAdminTournaments).toHaveBeenCalled();
    
    // Ждем, пока данные загрузятся и отобразятся
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Проверяем отображение статистики
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Total Tournaments')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Active Tournaments')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pending Registrations')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
  });
  
  it('allows switching between tabs', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Проверяем, что изначально открыт таб Dashboard
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    
    // Переключаемся на таб Users
    fireEvent.click(screen.getByText('Users'));
    
    // Проверяем, что таблица пользователей отображается
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Проверяем отображение данных пользователей
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Переключаемся на таб Tournaments
    fireEvent.click(screen.getByText('Tournaments'));
    
    // Проверяем, что таблица турниров отображается
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Registrations')).toBeInTheDocument();
    
    // Проверяем отображение данных турниров
    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    expect(screen.getByText('Active Tournament')).toBeInTheDocument();
    expect(screen.getByText('Completed Tournament')).toBeInTheDocument();
  });
  
  it('allows changing user role', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Переключаемся на таб Users
    fireEvent.click(screen.getByText('Users'));
    
    // Находим селект для изменения роли
    const userRoleSelect = screen.getAllByRole('combobox')[0];
    expect(userRoleSelect).toBeInTheDocument();
    
    // Изменяем роль пользователя
    fireEvent.change(userRoleSelect, { target: { value: 'ADMIN' } });
    
    // Проверяем, что API вызван с правильными параметрами
    await waitFor(() => {
      expect(updateUserRole).toHaveBeenCalledWith('1', 'ADMIN');
    });
  });
  
  it('allows changing tournament status', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Переключаемся на таб Tournaments
    fireEvent.click(screen.getByText('Tournaments'));
    
    // Находим селект для изменения статуса турнира
    const tournamentStatusSelect = screen.getAllByRole('combobox')[0];
    expect(tournamentStatusSelect).toBeInTheDocument();
    
    // Изменяем статус турнира
    fireEvent.change(tournamentStatusSelect, { target: { value: 'in_progress' } });
    
    // Проверяем, что API вызван с правильными параметрами
    await waitFor(() => {
      expect(updateTournamentStatus).toHaveBeenCalledWith('1', 'in_progress');
    });
  });
  
  it('handles API errors gracefully', async () => {
    // Мокируем ошибку при загрузке данных
    (getAdminStats as jest.Mock).mockRejectedValue(new Error('Failed to fetch stats'));
    
    render(<AdminPanel />);
    
    // Ждем отображения сообщения об ошибке
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch stats')).toBeInTheDocument();
    });
  });
  
  it('handles user role update error', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Переключаемся на таб Users
    fireEvent.click(screen.getByText('Users'));
    
    // Мокируем ошибку при обновлении роли
    (updateUserRole as jest.Mock).mockRejectedValue(new Error('Failed to update user role'));
    
    // Находим селект для изменения роли
    const userRoleSelect = screen.getAllByRole('combobox')[0];
    
    // Изменяем роль пользователя
    fireEvent.change(userRoleSelect, { target: { value: 'ADMIN' } });
    
    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Failed to update user role')).toBeInTheDocument();
    });
  });
  
  it('handles tournament status update error', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Переключаемся на таб Tournaments
    fireEvent.click(screen.getByText('Tournaments'));
    
    // Мокируем ошибку при обновлении статуса
    (updateTournamentStatus as jest.Mock).mockRejectedValue(new Error('Failed to update tournament status'));
    
    // Находим селект для изменения статуса
    const tournamentStatusSelect = screen.getAllByRole('combobox')[0];
    
    // Изменяем статус турнира
    fireEvent.change(tournamentStatusSelect, { target: { value: 'completed' } });
    
    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Failed to update tournament status')).toBeInTheDocument();
    });
  });
}); 