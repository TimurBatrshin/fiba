# FIBA 3x3 Application

## 🏀 Project Overview

FIBA 3x3 is a web application for managing and participating in FIBA 3x3 basketball tournaments. The application allows users to browse tournaments, register teams, and manage their basketball profiles.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd fiba

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm start

# The application will be available at http://localhost:8099
```

### Building the Application

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

## 📦 Project Structure

```
fiba/
├── src/               # Source files
│   ├── api/           # API integration
│   ├── @types/        # TypeScript type definitions
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Application pages
│   ├── routes/        # Route definitions
│   ├── services/      # Business logic services
│   ├── styles/        # CSS/SCSS styles
│   ├── utils/         # Utility functions
│   ├── app.tsx        # Main application component
│   └── index.tsx      # Application entry point
├── public/            # Static assets
├── dist/              # Build output
├── .env               # Environment variables
├── .env.example       # Example environment variables
├── bro.config.js      # Bro.js configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies and scripts
```

## 📋 Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for development
- `npm run build:prod` - Builds the app for production
- `npm test` - Runs unit tests
- `npm run test:coverage` - Runs tests with coverage report
- `npm run lint` - Checks for linting errors
- `npm run lint:fix` - Fixes linting errors
- `npm run format` - Formats code using Prettier
- `npm run deploy` - Deploys the application using GitHub Pages

## 🔄 Versioning and Releases

The project uses Semantic Versioning (SemVer). To create new versions, use the following commands:

```bash
# Patch version for bug fixes (1.0.0 -> 1.0.1)
npm run release:patch

# Minor version for small improvements (1.0.0 -> 1.1.0)
npm run release:minor

# Major version for significant changes (1.0.0 -> 2.0.0)
npm run release:major
```

These commands automatically:
1. Increment the version number in package.json
2. Create a commit with the updated version
3. Add a version tag (e.g., "v1.2.3")
4. Push changes and tag to the remote repository

## 🧪 Testing and Error Handling

### Unit Testing

The project is configured to use Jest for unit testing. Test files are located in `__tests__` directories or have `.test.ts` / `.test.tsx` extensions.

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Testing

End-to-End (E2E) tests use Cypress to check the application in a real browser. E2E test files are located in the `cypress/e2e/` directory.

```bash
# Run Cypress tests in terminal
npm run test:e2e

# Run Cypress tests in GUI
npm run cypress:open
```

### Continuous Integration (CI)

The project is configured to use GitHub Actions for continuous integration. The configuration file is located in `.github/workflows/ci.yml`. CI automatically runs:

1. Linting
2. Unit tests
3. E2E tests
4. Project build

CI runs on each push to the `main` and `develop` branches, as well as when creating pull requests to these branches.

## 👨‍💻 Development Guidelines

- Follow the established code style and conventions
- Write unit tests for new features
- Keep components small and focused on a single responsibility
- Use TypeScript types for better code quality
- Document complex logic with comments

## Тестирование и обработка ошибок

### Модульное тестирование

Проект настроен на использование Jest для модульного тестирования. Файлы тестов находятся в директориях `__tests__` или имеют расширение `.test.ts` / `.test.tsx`.

Для запуска модульных тестов используйте:

```bash
# Запуск всех модульных тестов
npm test

# Запуск тестов в режиме наблюдения за изменениями
npm run test:watch

# Запуск тестов с генерацией отчета о покрытии
npm run test:coverage
```

### Интеграционное тестирование

Интеграционные тесты проверяют взаимодействие между различными частями приложения. Они находятся в директории `src/__tests__/integration/`.

```bash
# Запуск интеграционных тестов
npm test -- --testPathPattern=integration
```

### End-to-End тестирование

End-to-End (E2E) тесты используют Cypress для проверки приложения в реальном браузере. Файлы E2E тестов расположены в директории `cypress/e2e/`.

```bash
# Запуск тестов Cypress в терминале
npm run test:e2e

# Запуск тестов Cypress в графическом интерфейсе
npm run cypress:open
```

### Непрерывная интеграция (CI)

Проект настроен для использования GitHub Actions для непрерывной интеграции. Конфигурационный файл находится в `.github/workflows/ci.yml`. CI автоматически запускает:

1. Линтинг
2. Модульные тесты
3. E2E тесты
4. Сборку проекта

CI запускается при каждом push в ветки `main` и `develop`, а также при создании pull request в эти ветки.

### Система обработки ошибок

Проект имеет централизованную систему обработки ошибок, которая включает:

1. **Глобальный обработчик ошибок** (`src/utils/globalErrorHandler.ts`) - перехватывает и обрабатывает ошибки во всем приложении
2. **Error Boundary** (`src/components/ErrorBoundary.tsx`) - React-компонент для перехвата ошибок рендеринга
3. **ErrorToast** (`src/components/ErrorToast.tsx`) - компонент для отображения пользовательских уведомлений об ошибках

#### Типы ошибок

Система обрабатывает следующие типы ошибок:

- **API ошибки** - ошибки при взаимодействии с сервером
- **Ошибки валидации** - ошибки в формах и пользовательском вводе
- **Ошибки авторизации** - проблемы с аутентификацией и авторизацией
- **Сетевые ошибки** - проблемы с сетевым подключением
- **Неизвестные ошибки** - прочие ошибки, не входящие в вышеперечисленные категории

#### Логирование ошибок

Все ошибки автоматически логируются с помощью `src/utils/logger.ts`. В режиме разработки логи выводятся в консоль, а в продакшене могут быть настроены для отправки на сервер.

#### Использование в коде

```tsx
// Пример использования глобального обработчика ошибок
import globalErrorHandler from '../utils/globalErrorHandler';

try {
  // Потенциально опасный код
} catch (error) {
  globalErrorHandler.handleError(error);
}

// Пример использования Error Boundary
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Разработка и запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для разработки
npm run build

# Сборка для продакшена
npm run build:prod
```

## New in Version 1.6.0

### Performance Improvements
- Optimized data loading for tournament list
- Reduced initial page load time by 30%

### New Features
- Added tournament statistics dashboard
- Implemented real-time updates for live matches
- Added multi-language support (English, Spanish, French)

### Bug Fixes
- Fixed team registration form validation issues
- Resolved calendar display problems on mobile devices
- Fixed authentication token refresh mechanism 