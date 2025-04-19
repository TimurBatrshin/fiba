import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../login';
import { AuthService } from '../../../services/AuthService';

// Мокаем компоненты роутера и сервисы
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
    <a href={to}>{children}</a>
}));

jest.mock('../../../services/AuthService', () => {
  return {
    AuthService: {
      getInstance: jest.fn().mockReturnValue({
        login: jest.fn(),
        isAuthenticated: jest.fn().mockReturnValue(false)
      })
    }
  };
});

describe('Login Component', () => {
  // Получаем мок для AuthService
  const mockAuthService = {
    login: jest.fn(),
    isAuthenticated: jest.fn().mockReturnValue(false)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });

  // Функция для рендеринга компонента в тестах
  const renderLoginComponent = () => {
    const setIsAuthenticated = jest.fn();
    return {
      ...render(
        <BrowserRouter>
          <Login setIsAuthenticated={setIsAuthenticated} />
        </BrowserRouter>
      ),
      setIsAuthenticated
    };
  };

  it('renders login form correctly', () => {
    renderLoginComponent();

    // Проверяем наличие заголовка
    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
    
    // Проверяем поля формы
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    
    // Проверяем кнопку входа
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    
    // Проверяем ссылки
    expect(screen.getByText('Забыли пароль?')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    renderLoginComponent();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');

    // Вводим данные в поля
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Проверяем, что значения обновились
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows password when toggle button is clicked', () => {
    renderLoginComponent();

    const passwordInput = screen.getByLabelText('Пароль') as HTMLInputElement;
    
    // Изначально поле должно быть типа password
    expect(passwordInput.type).toBe('password');
    
    // Находим кнопку для отображения пароля
    const toggleButton = screen.getByRole('button', { name: '' });
    
    // Нажимаем кнопку
    fireEvent.click(toggleButton);
    
    // Проверяем, что тип поля изменился на text
    expect(passwordInput.type).toBe('text');
    
    // Нажимаем кнопку еще раз
    fireEvent.click(toggleButton);
    
    // Проверяем, что тип поля вернулся к password
    expect(passwordInput.type).toBe('password');
  });

  it('submits form with correct credentials', async () => {
    const { setIsAuthenticated } = renderLoginComponent();
    
    // Подготавливаем успешный ответ от сервиса
    mockAuthService.login.mockResolvedValueOnce({
      token: 'token123',
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });

    // Заполняем форму
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const submitButton = screen.getByRole('button', { name: 'Войти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Отправляем форму
    fireEvent.click(submitButton);
    
    // Проверяем, что вызвана функция login с правильными параметрами
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Ждем, пока не будет вызвана функция setIsAuthenticated с true
    await waitFor(() => {
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    });
  });

  it('shows error message on authentication failure', async () => {
    renderLoginComponent();
    
    // Подготавливаем ошибку от сервиса
    mockAuthService.login.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Неверные учетные данные' }
      }
    });

    // Заполняем форму
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const submitButton = screen.getByRole('button', { name: 'Войти' });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Отправляем форму
    fireEvent.click(submitButton);
    
    // Ждем, пока не появится сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
  });

  it('redirects to profile if already authenticated', () => {
    // Устанавливаем, что пользователь уже аутентифицирован
    mockAuthService.isAuthenticated.mockReturnValueOnce(true);
    
    // Получаем мок для useNavigate
    const mockNavigate = jest.fn();
    (require('react-router-dom') as any).useNavigate = () => mockNavigate;
    
    renderLoginComponent();
    
    // Проверяем, что был вызван редирект
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('clears error message when input values change', async () => {
    renderLoginComponent();
    
    // Подготавливаем ошибку от сервиса
    mockAuthService.login.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Неверные учетные данные' }
      }
    });

    // Заполняем форму
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const submitButton = screen.getByRole('button', { name: 'Войти' });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Отправляем форму
    fireEvent.click(submitButton);
    
    // Ждем, пока не появится сообщение об ошибке
    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
    
    // Меняем значение в поле
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    // Проверяем, что сообщение об ошибке исчезло
    expect(screen.queryByText('Неверный email или пароль')).not.toBeInTheDocument();
  });

  it('shows loading state during authentication', async () => {
    renderLoginComponent();
    
    // Создаем задержку для имитации загрузки
    mockAuthService.login.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            token: 'token123',
            user: { id: '1', email: 'test@example.com', name: 'Test User' }
          });
        }, 100);
      });
    });

    // Заполняем форму
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const submitButton = screen.getByRole('button', { name: 'Войти' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Отправляем форму
    fireEvent.click(submitButton);
    
    // Проверяем, что кнопка находится в состоянии загрузки
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('.button-loader')).toBeInTheDocument();
    
    // Ждем завершения запроса
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton.textContent).toBe('Войти');
    }, { timeout: 200 });
  });
}); 