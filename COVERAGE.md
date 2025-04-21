# Покрытие кода тестами (Code Coverage)

## Обзор

Покрытие кода тестами - это метрика, которая показывает, какой процент кода проверяется автоматическими тестами. Она помогает выявить непроверенные части кода и обеспечить надежность приложения.

## Текущая конфигурация

В нашем проекте используется Jest для тестирования и отслеживания покрытия кода. Конфигурация настроена в `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 30,
    functions: 30,
    lines: 30,
    statements: 30,
  },
  // Повышенные требования для критических компонентов
  "src/components/AdminPanel.tsx": {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  "src/services/**/*.ts": {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

## Типы метрик покрытия

1. **Statements (Операторы)** - процент выполненных операторов кода.
2. **Branches (Ветви)** - процент пройденных ветвей условных операторов (if/else, switch).
3. **Functions (Функции)** - процент вызванных функций.
4. **Lines (Строки)** - процент выполненных строк кода.

## Команды для запуска тестов с покрытием

```bash
# Запуск тестов с базовым отчетом о покрытии
npm run test:coverage

# Запуск тестов с подробным отчетом о покрытии
npm run test:coverage:detail

# Запуск тестов конкретного файла с покрытием
npm run test:specific -- path/to/component.test.tsx

# Открытие отчета о покрытии в браузере
npm run coverage:open
```

## Как увеличить покрытие кода

1. **Приоритизация тестирования**:
   - Сначала тестируйте критические компоненты и сервисы.
   - Уделите внимание бизнес-логике и обработке ошибок.

2. **Стратегии тестирования**:
   - Используйте TDD (Test-Driven Development) для новых компонентов.
   - Добавляйте тесты для обнаруженных багов, чтобы предотвратить регрессию.

3. **Типы тестов**:
   - Модульные тесты (Unit tests) для отдельных функций и компонентов.
   - Интеграционные тесты для взаимодействия между модулями.
   - E2E тесты для критических путей пользователя.

4. **Лучшие практики**:
   - Тестируйте граничные случаи и обработку ошибок.
   - Используйте моки для изоляции тестируемого кода.
   - Проверяйте различные входные данные и условия.

## Исключение файлов из покрытия

Некоторые файлы могут быть исключены из расчета покрытия:

- Типы и интерфейсы (`.d.ts`)
- Конфигурационные файлы
- Мокнутые данные
- Константы и перечисления
- Стороннее ПО в `node_modules`

Это настраивается в `jest.config.js` и `.jestignore`.

## Рекомендации по созданию тестов

### Для компонентов React:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<YourComponent />);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    await waitFor(() => {
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
  });
});
```

### Для сервисов и утилит:

```typescript
import YourService from '../YourService';

describe('YourService', () => {
  it('processes data correctly', () => {
    const result = YourService.processData({ test: 'data' });
    expect(result).toEqual({ processed: 'data' });
  });

  it('handles errors', () => {
    expect(() => YourService.processData(null)).toThrow('Invalid data');
  });
});
```

## CI/CD интеграция

Проверка покрытия кода интегрирована в CI/CD процесс:

1. Тесты запускаются автоматически для каждого Pull Request.
2. Требуется минимальное покрытие для успешного прохождения CI.
3. Отчеты о покрытии автоматически публикуются.

Конфигурация находится в `.github/workflows/test-coverage.yml`.

## Текущее состояние покрытия

Текущее покрытие кода можно увидеть, выполнив `npm run test:coverage`. Отчёт будет сохранен в директории `coverage/`.

## Целевые показатели

- Глобальное покрытие: минимум 30% для всех метрик.
- Критические компоненты (например, AdminPanel): минимум 80%.
- Сервисный слой: минимум 70%.

## Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Trophy](https://kentcdodds.com/blog/write-tests) 