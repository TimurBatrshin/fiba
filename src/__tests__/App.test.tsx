import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../app';
import { AuthService } from '../services/AuthService';

// Мокируем все компоненты, которые используются в App
jest.mock('../widgets/navbar/navbar', () => ({
  __esModule: true,
  default: ({ isAuthenticated }: { isAuthenticated: boolean }) => <div data-testid="navbar">Navbar: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>,
}));

jest.mock('../pages/home/home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('../pages/tournaments/tournaments', () => ({
  __esModule: true,
  default: () => <div data-testid="tournaments-page">Tournaments Page</div>,
}));

jest.mock('../pages/profile/profile', () => ({
  __esModule: true,
  default: ({ isAuthenticated }: { isAuthenticated: boolean }) => <div data-testid="profile-page">Profile Page: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>,
}));

jest.mock('../pages/tournament/tournament', () => ({
  __esModule: true,
  default: () => <div data-testid="tournament-page">Tournament Page</div>,
}));

jest.mock('../pages/registerUser/registerUser', () => ({
  __esModule: true,
  default: () => <div data-testid="register-page">Register Page</div>,
}));

jest.mock('../pages/login/login', () => ({
  __esModule: true,
  default: ({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) => (
    <div data-testid="login-page">
      Login Page
      <button onClick={() => setIsAuthenticated(true)}>Login</button>
    </div>
  ),
}));

jest.mock('../pages/admin', () => ({
  Admin: () => <div data-testid="admin-page">Admin Page</div>,
}));

jest.mock('../pages/TopPlayers/TopPlayers', () => ({
  __esModule: true,
  default: () => <div data-testid="top-players-page">Top Players Page</div>,
}));

jest.mock('../components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

jest.mock('../components/ErrorToast', () => ({
  __esModule: true,
  default: () => <div data-testid="error-toast">Error Toast</div>,
}));

// Мокируем AuthService
jest.mock('../services/AuthService', () => ({
  AuthService: {
    getInstance: jest.fn().mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(false),
      getToken: jest.fn().mockReturnValue(null),
    }),
  },
}));

// Мокируем хук useAuth из контекста авторизации
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: false,
    currentRole: 'USER',
  }),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup(); // Clean up after each test to prevent duplicate elements
    
    // Сбрасываем мок для useAuth по умолчанию
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: false,
      currentRole: 'USER',
    });
  });
  
  afterEach(() => {
    cleanup(); // Also clean up after each test
  });
  
  it('renders without crashing', () => {
    render(<App />);
    
    // Проверяем, что основные компоненты отрендерены
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('error-toast')).toBeInTheDocument();
  });
  
  it('renders home page by default', () => {
    render(<App />);
    
    // Переходим на начальную страницу (обычно это '/')
    window.history.pushState({}, '', '/');
    
    // Проверяем, что отображается домашняя страница
    const homePages = screen.getAllByTestId('home-page');
    expect(homePages.length).toBeGreaterThan(0);
    expect(homePages[0]).toBeInTheDocument();
  });
  
  it('wraps each route with ErrorBoundary', () => {
    render(<App />);
    
    // Должно быть несколько ErrorBoundary компонентов (вокруг каждого маршрута)
    const errorBoundaries = screen.getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(1);
  });
  
  it('uses AuthProvider for context', () => {
    render(<App />);
    
    // Проверяем, что AuthProvider присутствует
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
  
  it('passes isAuthenticated to Navbar', () => {
    // Устанавливаем, что пользователь не аутентифицирован
    (AuthService.getInstance as jest.Mock).mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(false),
      getToken: jest.fn().mockReturnValue(null),
    });
    
    render(<App />);
    
    // Проверяем, что Navbar получает правильное значение isAuthenticated
    const navbars = screen.getAllByTestId('navbar');
    expect(navbars[0]).toHaveTextContent('Not Authenticated');
    
    // Очищаем перед повторным рендерингом
    cleanup();
    
    // Теперь устанавливаем, что пользователь аутентифицирован
    (AuthService.getInstance as jest.Mock).mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(true),
      getToken: jest.fn().mockReturnValue('test-token'),
    });
    
    // Рендерим снова
    render(<App />);
    
    // Проверяем, что Navbar получает обновленное значение
    const authenticatedNavbars = screen.getAllByTestId('navbar');
    expect(authenticatedNavbars[0]).toHaveTextContent('Authenticated');
  });
  
  it('redirects authenticated users from login page', () => {
    // Устанавливаем, что пользователь аутентифицирован
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: true,
      currentRole: 'USER',
    });
    
    // Переходим на страницу логина
    window.history.pushState({}, '', '/fiba/login');
    
    render(<App />);
    
    // Страница логина не должна отображаться (должен быть редирект)
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
  
  it('allows authenticated users to access protected routes', () => {
    // Устанавливаем, что пользователь аутентифицирован
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: true,
      currentRole: 'USER',
    });
    
    // Переходим на защищенный маршрут
    window.history.pushState({}, '', '/fiba/profile');
    
    render(<App />);
    
    // Страница профиля должна отображаться
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });
  
  it('redirects non-authenticated users away from protected routes', () => {
    // Устанавливаем, что пользователь не аутентифицирован
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: false,
      currentRole: 'USER',
    });
    
    // Переходим на защищенный маршрут
    window.history.pushState({}, '', '/fiba/profile');
    
    render(<App />);
    
    // Страница профиля не должна отображаться
    expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
  });
  
  it('allows admin users to access admin routes', () => {
    // Устанавливаем, что пользователь аутентифицирован и имеет роль ADMIN
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: true,
      currentRole: 'ADMIN',
    });
    
    // Переходим на административный маршрут
    window.history.pushState({}, '', '/fiba/admin');
    
    render(<App />);
    
    // Должна отображаться административная страница
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
  });
  
  it('redirects non-admin users away from admin routes', () => {
    // Устанавливаем, что пользователь аутентифицирован, но не имеет роли ADMIN
    (require('../contexts/AuthContext') as any).useAuth = jest.fn().mockReturnValue({
      isAuthenticated: true,
      currentRole: 'USER',
    });
    
    // Переходим на административный маршрут
    window.history.pushState({}, '', '/fiba/admin');
    
    render(<App />);
    
    // Административная страница не должна отображаться
    expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
  });
  
  it('listens for storage events to update authentication status', () => {
    render(<App />);
    
    // Получаем функцию-обработчик события storage из useEffect
    const authServiceInstance = AuthService.getInstance();
    expect(authServiceInstance.isAuthenticated).toHaveBeenCalled();
    
    // Имитируем событие storage
    const storageEvent = new Event('storage');
    window.dispatchEvent(storageEvent);
    
    // Проверяем, что isAuthenticated вызывается повторно
    expect(authServiceInstance.isAuthenticated).toHaveBeenCalledTimes(2);
  });
}); 