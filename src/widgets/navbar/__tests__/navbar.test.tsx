import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../navbar';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Мокаем контекст аутентификации
jest.mock('../../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../../contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn(() => ({
      isAuthenticated: true,
      currentUser: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' },
      currentRole: 'USER',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })),
  };
});

// Получаем мок хука useAuth для управления его возвращаемым значением
const mockUseAuth = useAuth as jest.Mock;

// Компонент-обертка для предоставления контекста
const renderWithRouter = (ui: React.ReactNode, { isAuthenticated = false } = {}) => {
  // Обновляем мок useAuth для текущего теста
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    currentUser: isAuthenticated ? { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' } : null,
    currentRole: isAuthenticated ? 'USER' : null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  });
  
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders logo correctly', () => {
    renderWithRouter(<Navbar isAuthenticated={false} />);
    
    const logoElement = screen.getByAltText('FIBA 3x3');
    expect(logoElement).toBeInTheDocument();
    
    const logoText = screen.getByText('FIBA');
    expect(logoText).toBeInTheDocument();
  });
  
  it('shows login/register buttons when not authenticated', () => {
    renderWithRouter(<Navbar isAuthenticated={false} />);
    
    const loginButton = screen.getByText('Войти');
    const registerButton = screen.getByText('Регистрация');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
    
    // Проверяем, что кнопка выхода не отображается
    const logoutButton = screen.queryByText('Выйти');
    expect(logoutButton).not.toBeInTheDocument();
  });
  
  it('shows logout button when authenticated', () => {
    renderWithRouter(<Navbar isAuthenticated={true} />);
    
    const logoutButton = screen.getByText('Выйти');
    expect(logoutButton).toBeInTheDocument();
    
    // Проверяем, что кнопки входа и регистрации не отображаются
    const loginButton = screen.queryByText('Войти');
    const registerButton = screen.queryByText('Регистрация');
    
    expect(loginButton).not.toBeInTheDocument();
    expect(registerButton).not.toBeInTheDocument();
  });
  
  it('shows profile link when authenticated', () => {
    renderWithRouter(<Navbar isAuthenticated={true} />);
    
    const profileLink = screen.getByText('Профиль');
    expect(profileLink).toBeInTheDocument();
  });
  
  it('does not show profile link when not authenticated', () => {
    renderWithRouter(<Navbar isAuthenticated={false} />);
    
    const profileLink = screen.queryByText('Профиль');
    expect(profileLink).not.toBeInTheDocument();
  });
  
  it('calls logout when clicking the logout button', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' },
      currentRole: 'USER',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });
    
    renderWithRouter(<Navbar isAuthenticated={true} />);
    
    const logoutButton = screen.getByText('Выйти');
    fireEvent.click(logoutButton);
    
    // Проверяем, что метод logout из контекста был вызван
    expect(mockUseAuth().logout).toHaveBeenCalled();
  });
  
  it('toggles stats dropdown when clicking on button', () => {
    renderWithRouter(<Navbar isAuthenticated={false} />);
    
    // Находим кнопку статистики
    const statsButton = screen.getByText('Статистика');
    expect(statsButton).toBeInTheDocument();
    
    // Проверяем, что выпадающее меню изначально скрыто
    const topPlayersLink = screen.queryByText('Топ игроки');
    expect(topPlayersLink).not.toBeInTheDocument();
    
    // Кликаем на кнопку
    fireEvent.click(statsButton);
    
    // Проверяем, что выпадающее меню отображается
    const topPlayersLinkAfterClick = screen.getByText('Топ игроки');
    expect(topPlayersLinkAfterClick).toBeInTheDocument();
  });
  
  it('navigates to correct paths when clicking on links', () => {
    renderWithRouter(<Navbar isAuthenticated={true} />);
    
    // Проверяем наличие навигационных ссылок
    const homeLink = screen.getByText('Главная');
    const tournamentsLink = screen.getByText('Турниры');
    
    expect(homeLink).toBeInTheDocument();
    expect(tournamentsLink).toBeInTheDocument();
    
    // Проверяем атрибуты href
    expect(homeLink.closest('a')).toHaveAttribute('href', '/fiba');
    expect(tournamentsLink.closest('a')).toHaveAttribute('href', '/fiba/tournaments');
  });
}); 