# Руководство по тестированию FIBA 3x3

## Содержание
- [Введение](#введение)
- [Структура тестов](#структура-тестов)
- [Инструменты](#инструменты)
- [Запуск тестов](#запуск-тестов)
- [Написание тестов](#написание-тестов)
- [Моки и стабы](#моки-и-стабы)
- [Тестовые утилиты](#тестовые-утилиты)
- [Покрытие кода](#покрытие-кода)
- [CI/CD интеграция](#cicd-интеграция)

## Введение

Тестирование является важной частью разработки проекта FIBA 3x3. Тесты помогают:
- Убедиться, что код работает как ожидается
- Предотвратить регрессии при изменении кода
- Документировать поведение компонентов и функций
- Облегчить рефакторинг

## Структура тестов

Тесты в проекте организованы следующим образом:

```
src/
  └── components/
      ├── Component.tsx
      └── __tests__/
          └── Component.test.tsx
  └── services/
      ├── Service.ts
      └── __tests__/
          └── Service.test.ts
  └── utils/
      ├── utility.ts
      └── __tests__/
          └── utility.test.ts
```

## Инструменты

В проекте используются следующие инструменты для тестирования:

- **Jest**: основной фреймворк для тестирования
- **React Testing Library**: библиотека для тестирования React компонентов
- **MSW (Mock Service Worker)**: для мокирования API запросов
- **jest-dom**: для дополнительных матчеров DOM

## Запуск тестов

### Все тесты

```bash
npm test
```

### С отчетом о покрытии

```bash
npm run test:coverage
```

### В режиме наблюдения

```bash
npm run test:watch
```

### CI тесты

```bash
npm run test:ci
```

## Написание тестов

### Компоненты

Тесты компонентов должны:
1. Проверять, что компонент рендерится без ошибок
2. Проверять наличие ключевых элементов интерфейса
3. Тестировать взаимодействие с пользователем (клики, ввод текста и т.д.)
4. Проверять, что компонент правильно реагирует на изменения props

Пример:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Сервисы

Тесты сервисов должны:
1. Проверять, что API вызывается с правильными параметрами
2. Тестировать обработку успешных ответов
3. Тестировать обработку ошибок
4. Проверять форматирование данных

Пример:

```tsx
import { AuthService } from '../AuthService';
import axios from 'axios';

jest.mock('axios');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = { data: { token: 'test-token' } };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const service = AuthService.getInstance();
    const result = await service.login('user@example.com', 'password');
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      { email: 'user@example.com', password: 'password' }
    );
    expect(result).toEqual(mockResponse.data);
  });
});
```

## Моки и стабы

### Мокирование модулей

Для мокирования модулей используйте `jest.mock()`:

```tsx
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
```

### Мокирование localStorage

```tsx
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### Мокирование API запросов

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'User' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Тестовые утилиты

В проекте есть набор тестовых утилит в `src/utils/__tests__/test-utils.tsx`:

```tsx
import { render } from '../../utils/__tests__/test-utils';

it('renders with auth context', () => {
  render(<MyComponent />, { isAuthenticated: true, userRole: 'ADMIN' });
  // ...
});
```

## Покрытие кода

Целевое покрытие кода:
- Операторы: 30%
- Ветвления: 30%
- Функции: 30%
- Строки: 30%

Приоритеты тестирования:
1. Сервисы API и бизнес-логика
2. Компоненты с состояниями и эффектами
3. Хуки и контексты
4. Утилиты

## CI/CD интеграция

Проект настроен на автоматическое выполнение тестов при каждом пуше и PR через GitHub Actions. Конфигурация находится в `.github/workflows/ci.yml`.

Тесты автоматически запускаются на:
- Каждый пуш в ветки `main`, `master` и `develop`
- Каждый PR в эти ветки

Отчеты о покрытии автоматически загружаются и доступны в артефактах сборки. 