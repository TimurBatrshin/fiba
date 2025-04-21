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

// Компонент с ошибкой для тестирования
const ThrowError = ({ errorMessage }: { errorMessage: string }) => {
  throw new Error(errorMessage);
};

// Компонент с ошибкой не синтаксического характера
const ThrowCustomError = () => {
  // @ts-ignore
  throw { 
    name: 'CustomError', 
    message: 'Это не стандартная ошибка JavaScript',
    code: 'CUSTOM_ERROR' 
  };
};

// Компонент с асинхронной ошибкой
const AsyncErrorComponent = () => {
  React.useEffect(() => {
    setTimeout(() => {
      throw new Error('Асинхронная ошибка');
    }, 0);
  }, []);
  
  return <div data-testid="async-component">Компонент с асинхронной ошибкой</div>;
};

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

  test('должен рендерить children, если нет ошибок', () => {
    render(
      <ErrorBoundary>
        <div data-testid="test-child">Test Content</div>
      </ErrorBoundary>
    );
    
    const childElement = screen.getByTestId('test-child');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Test Content');
  });

  test('должен отображать сообщение об ошибке, когда дочерний компонент выбрасывает исключение', () => {
    // Подавляем консольные ошибки React, которые возникают в тестовой среде
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorMessage = 'Тестовая ошибка компонента';
    
    render(
      <ErrorBoundary>
        <ThrowError errorMessage={errorMessage} />
      </ErrorBoundary>
    );
    
    // Проверяем, что компонент отображает сообщение об ошибке
    expect(screen.getByText(/произошла ошибка/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });

  test('должен отображать fallback UI при обработке нестандартных ошибок', () => {
    // Подавляем консольные ошибки React, которые возникают в тестовой среде
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowCustomError />
      </ErrorBoundary>
    );
    
    // Проверяем, что отображается резервный UI
    expect(screen.getByText(/произошла ошибка/i)).toBeInTheDocument();
    expect(screen.getByText(/не стандартная ошибка/i)).toBeInTheDocument();
  });

  test('должен предоставлять возможность повторить попытку (retry)', () => {
    // Подавляем консольные ошибки React, которые возникают в тестовой среде
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Мокаем window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError errorMessage="Ошибка для теста повторной попытки" />
      </ErrorBoundary>
    );
    
    // Находим и кликаем на кнопку повторной попытки
    const retryButton = screen.getByText(/попробовать снова/i);
    expect(retryButton).toBeInTheDocument();
    
    retryButton.click();
    
    // Проверяем, что была вызвана перезагрузка
    expect(window.location.reload).toHaveBeenCalled();
    
    // Восстанавливаем original reload
    window.location.reload = originalReload;
  });

  test('должен проверять наличие подробностей об ошибке', () => {
    // Подавляем консольные ошибки React, которые возникают в тестовой среде
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorMessage = 'Детализированная ошибка с трассировкой стека';
    
    render(
      <ErrorBoundary>
        <ThrowError errorMessage={errorMessage} />
      </ErrorBoundary>
    );
    
    // Проверяем наличие подробностей
    expect(screen.getByText(/детали ошибки/i)).toBeInTheDocument();
  });

  test('должен вызывать onError callback, если он предоставлен', () => {
    // Подавляем консольные ошибки React, которые возникают в тестовой среде
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const onErrorMock = jest.fn();
    const errorMessage = 'Ошибка для тестирования колбэка';
    
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError errorMessage={errorMessage} />
      </ErrorBoundary>
    );
    
    // Проверяем, был ли вызван колбэк
    expect(onErrorMock).toHaveBeenCalled();
    expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });
}); 