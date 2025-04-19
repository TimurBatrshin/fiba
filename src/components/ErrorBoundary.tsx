import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';
import globalErrorHandler, { ErrorType } from '../utils/globalErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Компонент ErrorBoundary для перехвата и обработки ошибок рендеринга в React
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку
    logger.error('React Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
    });

    // Обрабатываем ошибку через глобальный обработчик
    globalErrorHandler.handleError(error);

    // Вызываем callback если он предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Если определен fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Запасной UI по умолчанию
      return (
        <div className="error-boundary-fallback">
          <h2>Что-то пошло не так</h2>
          <p>Произошла ошибка при отображении компонента.</p>
          <details>
            <summary>Подробности ошибки</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-primary mt-3"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 