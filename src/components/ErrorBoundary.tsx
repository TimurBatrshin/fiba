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
  errorInfo: ErrorInfo | null;
}

/**
 * Компонент ErrorBoundary для перехвата и обработки ошибок рендеринга в React
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Сохраняем информацию об ошибке для отображения
    this.setState({ errorInfo });

    // Определяем тип ошибки для лучшей обработки
    let errorType = 'unknown';
    let suggestion = '';
    
    // Определение типичных JavaScript ошибок
    if (error.message.includes('is not a function')) {
      errorType = 'function-call-error';
      suggestion = 'Вероятно, переменная не является функцией. Проверьте, что объект полностью загружен перед вызовом его методов.';
    } else if (error.message.includes('map') && error.message.includes('not a function')) {
      errorType = 'map-error';
      suggestion = 'Вероятно, функция map вызывается на переменной, не являющейся массивом. Убедитесь, что данные корректно загружены и являются массивом.';
    } else if (error.message.includes('Cannot read') && error.message.includes('of undefined')) {
      errorType = 'undefined-property-error';
      suggestion = 'Попытка доступа к свойству объекта, который не определен. Проверьте, что объект инициализирован перед доступом к его свойствам.';
    }

    // Подробно логируем ошибку
    logger.error(`React Error Boundary caught an error (${errorType})`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      componentStack: errorInfo.componentStack,
      suggestion
    });
    
    // Дополнительно логируем в консоль для удобства отладки
    console.error(`Error caught by ErrorBoundary (${errorType}):`, {
      error,
      info: errorInfo.componentStack,
      suggestion
    });

    // Обрабатываем ошибку через глобальный обработчик
    globalErrorHandler.handleError(error);

    // Вызываем callback если он предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Метод для перезагрузки компонента
  private resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  // Метод для полной перезагрузки страницы
  private reloadPage = (): void => {
    window.location.reload();
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Если определен fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Запасной UI по умолчанию с улучшенным отображением
      return (
        <div className="error-boundary-fallback p-4 border rounded my-3 bg-light">
          <h2 className="text-danger">Что-то пошло не так</h2>
          <p className="text-muted">Произошла ошибка при отображении компонента.</p>
          
          <div className="alert alert-warning">
            <strong>Тип ошибки:</strong> {this.state.error?.name}<br/>
            <strong>Сообщение:</strong> {this.state.error?.message}
          </div>
          
          <details className="mb-3">
            <summary className="text-primary cursor-pointer">Технические подробности</summary>
            <div className="mt-2 p-2 bg-dark text-light rounded">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error?.stack}
              </pre>
              <hr/>
              <h6>Component Stack:</h6>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          </details>
          
          <div className="d-flex gap-2">
            <button
              onClick={this.resetError}
              className="btn btn-primary"
            >
              Попробовать снова
            </button>
            <button
              onClick={this.reloadPage}
              className="btn btn-secondary"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 