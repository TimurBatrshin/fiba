import React, { ReactElement } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthService } from '../services/AuthService';

// Перезаписываем импорты для моков
jest.mock('../services/AuthService', () => ({
  AuthService: {
    getInstance: jest.fn().mockReturnValue({
      isAuthenticated: jest.fn().mockReturnValue(true),
      getCurrentUser: jest.fn().mockReturnValue({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER'
      }),
      getCurrentUserRole: jest.fn().mockReturnValue('USER'),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      getToken: jest.fn().mockReturnValue('test-token'),
    }),
  },
}));

// Типы для параметров
interface AllTheProvidersProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  userRole?: string;
  initialEntries?: string[];
  initialIndex?: number;
}

// Обертка с контекстами для тестов
const AllTheProviders = ({ 
  children, 
  isAuthenticated = true, 
  userRole = 'USER',
  initialEntries = ['/'],
  initialIndex = 0 
}: AllTheProvidersProps) => {
  // Подготавливаем моки для AuthService
  const mockAuthService = {
    isAuthenticated: jest.fn().mockReturnValue(isAuthenticated),
    getCurrentUser: jest.fn().mockReturnValue(
      isAuthenticated 
        ? {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: userRole
          }
        : null
    ),
    getCurrentUserRole: jest.fn().mockReturnValue(isAuthenticated ? userRole : null),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    getToken: jest.fn().mockReturnValue(isAuthenticated ? 'test-token' : null),
  };
  
  // Устанавливаем значения для мока
  (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
};

// Кастомный метод рендеринга для использования в тестах
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  isAuthenticated?: boolean;
  userRole?: string;
  initialEntries?: string[];
  initialIndex?: number;
}

const customRender = (
  ui: ReactElement,
  {
    isAuthenticated = true,
    userRole = 'USER',
    initialEntries = ['/'],
    initialIndex = 0,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        {...props} 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        initialEntries={initialEntries}
        initialIndex={initialIndex}
      />
    ),
    ...renderOptions,
  });
};

// Рендер с определенным роутом
interface RenderWithRouteOptions extends CustomRenderOptions {
  path?: string;
}

const renderWithRoute = (
  ui: ReactElement,
  {
    path = '/',
    isAuthenticated = true,
    userRole = 'USER',
    initialEntries = ['/'],
    initialIndex = 0,
    ...renderOptions
  }: RenderWithRouteOptions = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <AuthProvider>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
    renderOptions
  );
};

// Мок для axios
const mockAxiosResponse = (data: any, status = 200) => {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
};

// Добавляем минимальный тест для файла
describe('Test Utils', () => {
  it('renders with custom render', () => {
    customRender(<div data-testid="test-element">Test</div>);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
});

// Экспортируем все утилиты
export { 
  customRender as render, 
  renderWithRoute,
  mockAxiosResponse,
  AllTheProviders 
};

// Переэкспортируем остальные функции из testing-library
export * from '@testing-library/react'; 