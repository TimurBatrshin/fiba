import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';
import logger from '../../utils/logger';
import globalErrorHandler from '../../utils/globalErrorHandler';

// Мокируем зависимости
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

jest.mock('../../utils/globalErrorHandler', () => ({
  handleError: jest.fn(),
  __esModule: true,
  default: { handleError: jest.fn() },
}));

// Компонент с ошибкой для тестирования ErrorBoundary
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Component is working normally</div>;
};

// Сброс состояния ErrorBoundary между тестами
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-component">Normal Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('renders fallback UI when child component throws an error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Проверяем, что отображается fallback UI
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(screen.getByText('Произошла ошибка при отображении компонента.')).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('logs error and calls global error handler when an error occurs', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Проверяем, что ошибка залогирована
    expect(logger.error).toHaveBeenCalled();
    
    // Проверяем, что вызван глобальный обработчик ошибок
    expect(globalErrorHandler.handleError).toHaveBeenCalled();
    
    spy.mockRestore();
  });

  it('calls onError callback when provided', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockOnError = jest.fn();
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Проверяем, что колбэк вызван
    expect(mockOnError).toHaveBeenCalled();
    
    spy.mockRestore();
  });

  it('uses custom fallback component when provided', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Проверяем, что отображается кастомный fallback
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('resets error state when "Попробовать снова" button is clicked', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Проверяем наличие кнопки сброса
    const resetButton = screen.getByText('Попробовать снова');
    expect(resetButton).toBeInTheDocument();
    
    // Кликаем кнопку сброса (это сбросит hasError, но компонент всё равно бросит ошибку)
    fireEvent.click(resetButton);
    
    // Проверяем, что fallback UI всё ещё отображается (так как ErrorComponent не изменился)
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    
    spy.mockRestore();
  });
}); 