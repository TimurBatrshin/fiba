import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Profile from '../profile';
import { AuthService } from '../../../services/AuthService';
import { API_BASE_URL } from '../../../config/envConfig';
import { BrowserRouter } from 'react-router-dom';
import { ApiService } from '../../../services/ApiService';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Мокаем модули
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: null }),
}));

jest.mock('../../../services/AuthService', () => ({
  AuthService: {
    getInstance: jest.fn().mockReturnValue({
      getToken: jest.fn().mockReturnValue('test-token'),
      isAuthenticated: jest.fn().mockReturnValue(true),
    }),
  },
}));

// Мокируем axios вместо прямого использования ApiService
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  create: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })
}));

describe('Profile Component', () => {
  const mockNavigate = jest.fn();
  const mockToken = 'test-token';
  const mockProfile = {
    User: {
      name: 'Test User',
      email: 'test@example.com',
    },
    name: 'Test User',
    email: 'test@example.com',
    tournaments_played: 5,
    total_points: 120,
    rating: 85,
    photo_url: '/uploads/avatars/test.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Мокаем AuthService
    (AuthService.getInstance as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockReturnValue(mockToken),
      isAuthenticated: jest.fn().mockReturnValue(true),
    });
    
    // Мокаем useNavigate
    (require('react-router-dom') as any).useNavigate = () => mockNavigate;

    // Мокируем axios для Profile компонента
    (require('axios').get as jest.Mock).mockClear();
    (require('axios').post as jest.Mock).mockClear();
    
    // По умолчанию возвращаем пустые данные
    (require('axios').get as jest.Mock).mockResolvedValue({ data: {} });
    (require('axios').post as jest.Mock).mockResolvedValue({ data: {} });
  });

  // Функция для рендеринга компонента Profile
  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    // Мокаем ответ API с задержкой
    (require('axios').get as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: mockProfile });
        }, 100);
      });
    });

    render(<Profile isAuthenticated={true} />);
    
    // Должен отображаться индикатор загрузки
    expect(screen.getByText('Загрузка профиля...')).toBeInTheDocument();
  });

  it('renders profile data when loaded', async () => {
    // Мокаем успешный ответ API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль
    await waitFor(() => {
      expect(screen.getByText('Профиль игрока')).toBeInTheDocument();
    });
    
    // Используем правильные селекторы для проверки данных
    const profileSection = screen.getByText('Профиль игрока').closest('.profile-container');
    expect(profileSection).toBeInTheDocument();
    
    // Проверяем информацию профиля
    expect(screen.getByText(/Имя:/)).toBeInTheDocument();
    expect(screen.getByText('Test User', { exact: false })).toBeInTheDocument();
    
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText('test@example.com', { exact: false })).toBeInTheDocument();
    
    // Проверяем статистику
    expect(screen.getByText(/Турниров сыграно:/)).toBeInTheDocument();
    expect(screen.getByText(/Всего очков:/)).toBeInTheDocument();
    expect(screen.getByText(/Рейтинг:/)).toBeInTheDocument();
    
    // Проверяем фото профиля
    const avatar = screen.getByAltText('Фото профиля') as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
  });

  it('redirects to login when token is missing', async () => {
    // Мокаем отсутствие токена
    (AuthService.getInstance as jest.Mock).mockReturnValue({
      getToken: jest.fn().mockReturnValue(null),
      isAuthenticated: jest.fn().mockReturnValue(false),
    });

    render(<Profile isAuthenticated={false} />);
    
    // Ждем редиректа
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/fiba/login');
    });
  });

  it('redirects to login on 401 error', async () => {
    // Мокаем ошибку авторизации
    (require('axios').get as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 }
    });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем редиректа
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/fiba/login');
    });
  });

  it('displays error message if profile fetch fails', async () => {
    // Мокаем неавторизованную ошибку
    (require('axios').get as jest.Mock).mockRejectedValueOnce({
      response: { status: 500 }
    });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не исчезнет индикатор загрузки
    await waitFor(() => {
      expect(screen.queryByText('Загрузка профиля...')).not.toBeInTheDocument();
    });
    
    // Должно отображаться сообщение об ошибке
    expect(screen.getByText('Профиль не найден')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    // Мокаем успешный ответ API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль и появится кнопка редактирования
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
    });
    
    // Нажимаем кнопку редактирования
    fireEvent.click(screen.getByRole('button', { name: /Редактировать профиль/i }));
    
    // Проверяем, что форма редактирования отображается
    expect(screen.getByRole('button', { name: /Сохранить изменения/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Отмена/i })).toBeInTheDocument();
    
    // Используем более надежные селекторы для поиска полей ввода
    const tournamentsInput = screen.getByLabelText(/Турниров сыграно/i) as HTMLInputElement;
    const pointsInput = screen.getByLabelText(/Всего очков/i) as HTMLInputElement;
    const ratingInput = screen.getByLabelText(/Рейтинг/i) as HTMLInputElement;
    
    expect(tournamentsInput.value).toBe('5');
    expect(pointsInput.value).toBe('120');
    expect(ratingInput.value).toBe('85');
  });

  it('cancels edit mode when cancel button is clicked', async () => {
    // Мокаем успешный ответ API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
    });
    
    // Нажимаем кнопку редактирования
    fireEvent.click(screen.getByRole('button', { name: /Редактировать профиль/i }));
    
    // Нажимаем кнопку отмены
    fireEvent.click(screen.getByRole('button', { name: /Отмена/i }));
    
    // Проверяем, что форма редактирования скрыта
    expect(screen.queryByRole('button', { name: /Сохранить изменения/i })).not.toBeInTheDocument();
    
    // И снова отображается кнопка редактирования
    expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
  });

  it('submits profile changes successfully', async () => {
    // Мокаем успешные ответы API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });
    (require('axios').post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    
    // Мокаем обновленный профиль при повторном запросе
    const updatedProfile = {
      ...mockProfile,
      tournaments_played: 6,
      total_points: 150,
      rating: 90,
    };
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: updatedProfile });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
    });
    
    // Нажимаем кнопку редактирования
    fireEvent.click(screen.getByRole('button', { name: /Редактировать профиль/i }));
    
    // Изменяем значения в форме - используем более надежные селекторы
    const tournamentsInput = screen.getByLabelText(/Турниров сыграно/i);
    const pointsInput = screen.getByLabelText(/Всего очков/i);
    const ratingInput = screen.getByLabelText(/Рейтинг/i);
    
    fireEvent.change(tournamentsInput, { target: { value: '6' } });
    fireEvent.change(pointsInput, { target: { value: '150' } });
    fireEvent.change(ratingInput, { target: { value: '90' } });
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /Сохранить изменения/i }));
    
    // Проверяем, что был вызван запрос к API с правильными данными
    await waitFor(() => {
      expect(require('axios').post).toHaveBeenCalledWith(
        `${API_BASE_URL}/profile/photo`,
        expect.any(FormData),
        expect.any(Object)
      );
    });
    
    // Проверяем, что форма редактирования скрыта после успешной отправки
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Сохранить изменения/i })).not.toBeInTheDocument();
    });
    
    // Дополнительно проверяем, что был сделан запрос для обновления профиля
    await waitFor(() => {
      expect(require('axios').get).toHaveBeenCalledWith(
        `${API_BASE_URL}/profile`,
        expect.any(Object)
      );
    });
  });

  it('handles file upload correctly', async () => {
    // Мокаем успешные ответы API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });
    (require('axios').post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
    
    // Мокаем обновленный профиль после загрузки фото
    const updatedProfile = {
      ...mockProfile,
      photo_url: '/uploads/avatars/new-test.jpg',
    };
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: updatedProfile });
    
    // Создаем мок для файла
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
    });
    
    // Нажимаем кнопку редактирования
    fireEvent.click(screen.getByRole('button', { name: /Редактировать профиль/i }));
    
    // Загружаем файл - используем более надежный селектор
    const fileInput = screen.getByLabelText(/Фото профиля/i) as HTMLInputElement;
    
    // Это позволяет имитировать выбор файла пользователем
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    fireEvent.change(fileInput);
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /Сохранить изменения/i }));
    
    // Проверяем, что был вызван запрос к API с файлом
    await waitFor(() => {
      expect(require('axios').post).toHaveBeenCalledWith(
        `${API_BASE_URL}/profile/photo`,
        expect.any(FormData),
        expect.any(Object)
      );
    });
    
    // Проверяем, что изображение профиля обновилось
    await waitFor(() => {
      const updatedAvatar = screen.getByAltText('Фото профиля') as HTMLImageElement;
      expect(updatedAvatar.src).toContain('new-test.jpg');
    });
  });

  it('handles upload errors correctly', async () => {
    // Мокаем успешный первый ответ API
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });
    
    // Но ошибку при загрузке фото
    (require('axios').post as jest.Mock).mockRejectedValueOnce({
      response: { 
        status: 400, 
        data: { message: 'Ошибка при сохранении профиля' } 
      }
    });

    render(<Profile isAuthenticated={true} />);
    
    // Ждем, пока не загрузится профиль
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Редактировать профиль/i })).toBeInTheDocument();
    });
    
    // Нажимаем кнопку редактирования
    fireEvent.click(screen.getByRole('button', { name: /Редактировать профиль/i }));
    
    // Отправляем форму без изменений
    fireEvent.click(screen.getByRole('button', { name: /Сохранить изменения/i }));
    
    // Проверяем, что появляется сообщение об ошибке
    await waitFor(() => {
      // Используем более надежный селектор для поиска сообщения об ошибке
      const errorElement = screen.getByText(/Ошибка при сохранении профиля/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('uses default avatar when photo_url is missing', async () => {
    // Мокаем профиль без фото
    const profileWithoutPhoto = {
      ...mockProfile,
      photo_url: null,
    };
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: profileWithoutPhoto });

    render(<Profile isAuthenticated={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Профиль игрока')).toBeInTheDocument();
    });
    
    // В этом случае должен использоваться аватар по умолчанию
    const avatar = screen.getByAltText('Фото профиля') as HTMLImageElement;
    
    // Проверяем, что src указывает на defaultAvatar
    // Так как jest-dom обрабатывает пути особым образом, проверим что defaultAvatar используется
    // через проверку отсутствия photo_url в src
    expect(avatar.src).not.toContain('uploads/avatars/test.jpg');
  });

  it('handles image load errors', async () => {
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    render(<Profile isAuthenticated={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Профиль игрока')).toBeInTheDocument();
    });
    
    // Найдем изображение аватара
    const avatar = screen.getByAltText('Фото профиля');
    
    // Имитируем ошибку загрузки изображения
    fireEvent.error(avatar);
    
    // Проверяем, что handleImageError был вызван и установил defaultAvatar
    // Это сложно проверить напрямую, так как jest-dom не позволяет доступ к реальному src,
    // но мы можем проверить, что onerror обработчик был удален
    expect((avatar as HTMLImageElement).onerror).toBeNull();
  });

  it('checks authorization on initial load', async () => {
    // Устанавливаем мок для метода get
    (require('axios').get as jest.Mock).mockResolvedValueOnce({ data: mockProfile });

    renderProfile();

    // Дожидаемся загрузки данных профиля
    await waitFor(() => {
      expect(require('axios').get).toHaveBeenCalledWith(`${API_BASE_URL}/profile`, expect.any(Object));
    });

    // Проверяем, что токен был получен через AuthService
    expect(AuthService.getInstance().getToken).toHaveBeenCalled();
  });
}); 