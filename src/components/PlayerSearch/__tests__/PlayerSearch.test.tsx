import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerSearch from '../PlayerSearch';
import { searchPlayers } from '../../../services/api/tournaments';

// Мокаем API для поиска игроков
jest.mock('../../../services/api/tournaments', () => ({
  searchPlayers: jest.fn()
}));

const mockedSearchPlayers = searchPlayers as jest.MockedFunction<typeof searchPlayers>;

describe('PlayerSearch Component', () => {
  const mockOnSelect = jest.fn();
  const mockPlayers = [
    { id: 'player1', name: 'Player One', email: 'player1@example.com', photoUrl: null },
    { id: 'player2', name: 'Player Two', email: 'player2@example.com', photoUrl: 'https://example.com/photo2.jpg' },
    { id: 'player3', name: 'Player Three', email: 'player3@example.com', photoUrl: null }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // По умолчанию мокаем успешный ответ от API
    mockedSearchPlayers.mockResolvedValue(mockPlayers);
  });

  test('должен корректно рендериться в своем начальном состоянии', () => {
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Проверяем, что поле поиска отображается
    expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    
    // Проверяем, что начальные результаты не отображаются
    expect(screen.queryByText('Player One')).not.toBeInTheDocument();
  });

  test('должен вызывать API поиска при вводе текста', async () => {
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'player' } });
    
    // Проверяем, что API был вызван с правильным запросом
    await waitFor(() => {
      expect(mockedSearchPlayers).toHaveBeenCalledWith('player');
    });
  });

  test('должен отображать результаты поиска', async () => {
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'player' } });
    
    // Ждем, пока появятся результаты
    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument();
      expect(screen.getByText('Player Two')).toBeInTheDocument();
      expect(screen.getByText('Player Three')).toBeInTheDocument();
    });
    
    // Проверяем, что email отображается для игроков
    expect(screen.getByText('player1@example.com')).toBeInTheDocument();
  });

  test('должен вызывать onSelect при выборе игрока', async () => {
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'player' } });
    
    // Ждем, пока появятся результаты
    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument();
    });
    
    // Кликаем на игрока
    fireEvent.click(screen.getByText('Player One'));
    
    // Проверяем, что onSelect был вызван с выбранным игроком
    expect(mockOnSelect).toHaveBeenCalledWith(mockPlayers[0]);
  });

  test('должен корректно отображать сообщение, если игроки не найдены', async () => {
    // Мокаем пустой ответ от API
    mockedSearchPlayers.mockResolvedValueOnce([]);
    
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Ждем, пока появится сообщение о том, что игроки не найдены
    await waitFor(() => {
      expect(screen.getByText(/не найдено/i)).toBeInTheDocument();
    });
  });

  test('должен корректно обрабатывать ошибки API', async () => {
    // Мокаем ошибку от API
    mockedSearchPlayers.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'error' } });
    
    // Ждем, пока появится сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText(/ошибка/i)).toBeInTheDocument();
    });
  });

  test('не должен вызывать API, если строка поиска пуста', async () => {
    render(<PlayerSearch onSelect={mockOnSelect} />);
    
    // Находим поле ввода и вводим текст, затем очищаем
    const searchInput = screen.getByPlaceholderText(/поиск/i);
    
    // Вводим что-то
    fireEvent.change(searchInput, { target: { value: 'player' } });
    
    // Ждем первого вызова API
    await waitFor(() => {
      expect(mockedSearchPlayers).toHaveBeenCalledTimes(1);
    });
    
    // Очищаем поле
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Должны скрыться результаты поиска
    await waitFor(() => {
      expect(screen.queryByText('Player One')).not.toBeInTheDocument();
    });
    
    // Проверяем, что API не был вызван еще раз
    expect(mockedSearchPlayers).toHaveBeenCalledTimes(1);
  });
}); 