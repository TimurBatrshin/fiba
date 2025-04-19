import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/AuthService';

// Мокаем AuthService
jest.mock('../../services/AuthService', () => {
  return {
    AuthService: {
      getInstance: jest.fn(() => ({
        isAuthenticated: jest.fn(),
        getCurrentUser: jest.fn(() => ({ role: 'USER' })),
        getCurrentUserRole: jest.fn(() => 'USER'),
      }))
    }
  };
});

// Мокаем AuthContext, чтобы управлять состоянием аутентификации
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

// Создаем компоненты для тестирования
const HomePage = () => <div>Home Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const AdminPage = () => <div>Admin Page</div>;
const LoginPage = () => <div>Login Page</div>;

// Компонент защищенного маршрута
interface RouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Компонент маршрута администратора
const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, currentRole } = useAuth();
  return isAuthenticated && currentRole === 'ADMIN' ? <>{children}</> : <Navigate to="/" />;
};

describe('Protected Routes', () => {
  const mockUseAuth = useAuth as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders public route for unauthenticated users', () => {
    // Мокаем useAuth для неаутентифицированного пользователя
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      currentRole: null
    });
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    
    // На публичном маршруте должна быть главная страница
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
  
  it('redirects to login page from protected route when not authenticated', () => {
    // Мокаем useAuth для неаутентифицированного пользователя
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      currentRole: null
    });
    
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    
    // Должно перенаправить на страницу логина
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    // Страница профиля не должна отображаться
    expect(screen.queryByText('Profile Page')).not.toBeInTheDocument();
  });
  
  it('allows access to protected route when authenticated', () => {
    // Мокаем useAuth для аутентифицированного пользователя
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: '1', username: 'testuser', role: 'USER' },
      currentRole: 'USER'
    });
    
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    
    // Страница профиля должна отображаться
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });
  
  it('redirects to home page from admin route when not admin', () => {
    // Мокаем useAuth для обычного пользователя (не админ)
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: '1', username: 'testuser', role: 'USER' },
      currentRole: 'USER'
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    
    // Должно перенаправить на главную страницу
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    // Страница администратора не должна отображаться
    expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
  });
  
  it('allows access to admin route for admin users', () => {
    // Мокаем useAuth для администратора
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: '1', username: 'admin', role: 'ADMIN' },
      currentRole: 'ADMIN'
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    
    // Страница администратора должна отображаться
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });
}); 