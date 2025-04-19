import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ApiError, ValidationError, AuthError } from '../../utils/errorHandler';
import { ApiService } from '../../services/api';

// Define response types
type UserResponse = { id: number; name: string }[];
type CreateUserResponse = { data: { id: number; name: string }; message: string };
type ValidationErrorResponse = { message: string; errors: Record<string, string> };
type ProfileResponse = { data: { id: number; name: string; email: string }; message?: string };
type ErrorResponse = { message: string };

// Define request types
type CreateUserRequest = { name?: string };

// Настраиваем mock-сервер
export const server = setupServer(
  // Мокаем успешный GET-запрос
  rest.get('*/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
      ])
    );
  }),
  
  // Мокаем успешный POST-запрос
  rest.post('*/api/users', async (req, res, ctx) => {
    const userData = await req.json() as CreateUserRequest;
    
    // Проверяем валидацию
    if (!userData.name || userData.name.length < 3) {
      return res(
        ctx.status(400),
        ctx.json({
          message: 'Validation failed',
          errors: { name: 'Name must be at least 3 characters' },
        })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        data: { id: 3, name: userData.name },
        message: 'User created',
      })
    );
  }),
  
  // Мокаем запрос, требующий авторизации
  rest.get('*/api/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ message: 'Unauthorized' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        data: { id: 1, name: 'Test User', email: 'test@example.com' },
        message: 'Profile retrieved successfully'
      })
    );
  }),
  
  // Мокаем ошибку сервера
  rest.get('*/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Internal server error' })
    );
  }),
  
  // Fallback для необработанных запросов
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url.toString()}`);
    return res(
      ctx.status(404),
      ctx.json({ message: 'Not found' })
    );
  })
);

// Включаем и отключаем сервер перед и после всех тестов
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ApiService Integration Tests', () => {
  test('should fetch users successfully', async () => {
    const users = await ApiService.get('/api/users');
    expect(users).toEqual([
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
    ]);
  });
  
  test('should create a user successfully', async () => {
    const response = await ApiService.post('/api/users', { name: 'New User' });
    expect(response).toEqual({
      data: { id: 3, name: 'New User' },
      message: 'User created',
    });
  });
  
  test('should handle validation errors', async () => {
    try {
      await ApiService.post('/api/users', { name: 'AB' });
      fail('Should have thrown a ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.message).toBe('Validation failed');
        expect(error.errors).toEqual({ name: 'Name must be at least 3 characters' });
      }
    }
  });
  
  test('should handle unauthorized requests', async () => {
    try {
      await ApiService.get('/api/profile');
      fail('Should have thrown an AuthError');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      if (error instanceof AuthError) {
        expect(error.message).toBe('Unauthorized');
      }
    }
  });
  
  test('should access authorized endpoints with token', async () => {
    // Устанавливаем токен авторизации
    ApiService.setAuthToken('test-token');
    
    const profile = await ApiService.get('/api/profile');
    expect(profile).toEqual({
      data: { id: 1, name: 'Test User', email: 'test@example.com' },
      message: 'Profile retrieved successfully'
    });
    
    // Сбрасываем токен после теста
    ApiService.clearAuthToken();
  });
  
  test('should handle server errors', async () => {
    try {
      await ApiService.get('/api/error');
      fail('Should have thrown an ApiError');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.status).toBe(500);
        expect(error.message).toBe('Internal server error');
      }
    }
  });
}); 