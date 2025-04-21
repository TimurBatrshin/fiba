import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from '../AdminPanel';
import axios from 'axios';
import { API_BASE_URL } from '../../config/envConfig';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Мокаем навигацию
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AdminPanel', () => {
  // Заглушки для данных
  const mockTournaments = [
    { id: 't1', name: 'Tournament 1', date: '2023-08-01', status: 'registration' },
    { id: 't2', name: 'Tournament 2', date: '2023-09-01', status: 'in_progress' }
  ];
  
  const mockUsers = [
    { id: 'u1', name: 'User 1', email: 'user1@example.com', role: 'user' },
    { id: 'u2', name: 'User 2', email: 'user2@example.com', role: 'admin' }
  ];
  
  const mockRegistrations = [
    { 
      id: 'reg1', 
      team_name: 'Team 1', 
      status: 'pending', 
      tournament_id: 't1',
      players: [{ id: 'p1', name: 'Player 1' }]
    },
    { 
      id: 'reg2', 
      team_name: 'Team 2', 
      status: 'confirmed', 
      tournament_id: 't1',
      players: [{ id: 'p2', name: 'Player 2' }]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Устанавливаем заглушки для возвращаемых значений axios
    mockedAxios.get.mockImplementation((url) => {
      if (url === `${API_BASE_URL}/admin/tournaments`) {
        return Promise.resolve({ data: mockTournaments });
      } else if (url === `${API_BASE_URL}/admin/users`) {
        return Promise.resolve({ data: mockUsers });
      } else if (url.includes('/registrations')) {
        return Promise.resolve({ data: mockRegistrations });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  test('должен отображать список турниров', async () => {
    render(<AdminPanel />);
    
    // Проверяем, что по умолчанию активна вкладка с турнирами
    expect(screen.getByText(/управление турнирами/i)).toBeInTheDocument();
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
      expect(screen.getByText('Tournament 2')).toBeInTheDocument();
    });
  });

  test('должен переключаться между вкладками', async () => {
    render(<AdminPanel />);
    
    // Находим и нажимаем на вкладку "Пользователи"
    const usersTab = screen.getByText(/управление пользователями/i);
    fireEvent.click(usersTab);
    
    // Проверяем, что отображаются данные о пользователях
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
    
    // Возвращаемся на вкладку "Турниры"
    const tournamentsTab = screen.getByText(/управление турнирами/i);
    fireEvent.click(tournamentsTab);
    
    // Проверяем, что снова отображаются данные о турнирах
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });
  });

  test('должен отображать регистрации при клике на турнир', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });
    
    // Находим и нажимаем на кнопку "Просмотр регистраций" для турнира
    const viewRegistrationsButton = screen.getAllByText(/просмотр регистраций/i)[0];
    fireEvent.click(viewRegistrationsButton);
    
    // Проверяем, что отображаются данные о регистрациях
    await waitFor(() => {
      expect(screen.getByText('Team 1')).toBeInTheDocument();
      expect(screen.getByText('Team 2')).toBeInTheDocument();
    });
  });

  test('должен подтверждать регистрацию', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных о турнирах
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });
    
    // Открываем регистрации
    const viewRegistrationsButton = screen.getAllByText(/просмотр регистраций/i)[0];
    fireEvent.click(viewRegistrationsButton);
    
    // Ждем загрузки данных о регистрациях
    await waitFor(() => {
      expect(screen.getByText('Team 1')).toBeInTheDocument();
    });
    
    // Находим и нажимаем на кнопку "Подтвердить" для первой команды
    const approveButton = screen.getAllByText(/подтвердить/i)[0];
    fireEvent.click(approveButton);
    
    // Проверяем, что был вызван запрос к API
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/registrations/reg1/approve'),
        expect.anything(),
        expect.anything()
      );
    });
  });

  test('должен отклонять регистрацию', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных о турнирах
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });
    
    // Открываем регистрации
    const viewRegistrationsButton = screen.getAllByText(/просмотр регистраций/i)[0];
    fireEvent.click(viewRegistrationsButton);
    
    // Ждем загрузки данных о регистрациях
    await waitFor(() => {
      expect(screen.getByText('Team 1')).toBeInTheDocument();
    });
    
    // Находим и нажимаем на кнопку "Отклонить" для первой команды
    const rejectButton = screen.getAllByText(/отклонить/i)[0];
    fireEvent.click(rejectButton);
    
    // Проверяем, что был вызван запрос к API
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/registrations/reg1/reject'),
        expect.anything(),
        expect.anything()
      );
    });
  });

  test('должен удалять пользователя', async () => {
    render(<AdminPanel />);
    
    // Переходим на вкладку "Пользователи"
    const usersTab = screen.getByText(/управление пользователями/i);
    fireEvent.click(usersTab);
    
    // Ждем загрузки данных о пользователях
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
    
    // Находим и нажимаем на кнопку "Удалить" для первого пользователя
    const deleteButton = screen.getAllByText(/удалить/i)[0];
    fireEvent.click(deleteButton);
    
    // Проверяем, что был вызван запрос к API
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users/u1'),
        expect.anything()
      );
    });
  });

  test('должен обрабатывать ошибки загрузки данных', async () => {
    // Мокаем ошибку при загрузке турниров
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to load tournaments'));
    
    render(<AdminPanel />);
    
    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText(/ошибка загрузки данных/i)).toBeInTheDocument();
    });
  });

  test('должен открывать форму создания нового турнира', async () => {
    render(<AdminPanel />);
    
    // Находим и нажимаем на кнопку "Создать новый турнир"
    const createButton = screen.getByText(/создать новый турнир/i);
    fireEvent.click(createButton);
    
    // Проверяем, что был вызван переход на страницу создания турнира
    expect(mockNavigate).toHaveBeenCalledWith('/admin/tournaments/create');
  });

  test('должен открывать форму редактирования турнира', async () => {
    render(<AdminPanel />);
    
    // Ждем загрузки данных о турнирах
    await waitFor(() => {
      expect(screen.getByText('Tournament 1')).toBeInTheDocument();
    });
    
    // Находим и нажимаем на кнопку "Редактировать" для первого турнира
    const editButton = screen.getAllByText(/редактировать/i)[0];
    fireEvent.click(editButton);
    
    // Проверяем, что был вызван переход на страницу редактирования турнира
    expect(mockNavigate).toHaveBeenCalledWith('/admin/tournaments/t1/edit');
  });
}); 