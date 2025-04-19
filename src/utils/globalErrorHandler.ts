import logger from './logger';
import { ApiError, AuthError, ValidationError, ErrorHandler } from './errorHandler';

/**
 * Типы ошибок для централизованной обработки
 */
export enum ErrorType {
  API = 'api',
  VALIDATION = 'validation',
  AUTH = 'auth',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * Интерфейс для объекта результата обработки ошибок
 */
export interface ErrorResult {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
  validationErrors?: Record<string, string>;
  shouldLogout?: boolean;
}

/**
 * Глобальный обработчик ошибок
 */
class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorListeners: Array<(error: ErrorResult) => void> = [];

  /**
   * Получение синглтон-экземпляра
   */
  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * Приватный конструктор для паттерна Singleton
   */
  private constructor() {
    // Настраиваем глобальные обработчики
    this.setupGlobalHandlers();
  }

  /**
   * Настройка глобальных обработчиков исключений
   */
  private setupGlobalHandlers() {
    // Обработка необработанных ошибок
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
      
      // Логирование ошибок
      logger.error('Unhandled error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Обработка необработанных отклонений промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason || new Error('Unhandled Promise rejection'));
      
      // Логирование ошибок
      logger.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Добавление слушателя ошибок
   */
  public addErrorListener(listener: (error: ErrorResult) => void): () => void {
    this.errorListeners.push(listener);
    
    // Возвращаем функцию для удаления слушателя
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  /**
   * Обработка ошибки и уведомление слушателей
   */
  public handleError(error: any): ErrorResult {
    const errorResult = this.processError(error);
    
    // Логируем ошибку
    this.logError(errorResult);
    
    // Уведомляем слушателей
    this.notifyListeners(errorResult);
    
    return errorResult;
  }

  /**
   * Обработка и классификация ошибки
   */
  private processError(error: any): ErrorResult {
    if (error instanceof ApiError) {
      // Обработка API ошибок
      const shouldLogout = error.status === 401 || error.status === 403;
      
      return {
        type: ErrorType.API,
        message: ErrorHandler.getUserFriendlyMessage(error),
        details: error.data,
        statusCode: error.status,
        shouldLogout
      };
    } else if (error instanceof ValidationError) {
      // Обработка ошибок валидации
      return {
        type: ErrorType.VALIDATION,
        message: ErrorHandler.getUserFriendlyMessage(error),
        validationErrors: error.errors
      };
    } else if (error instanceof AuthError) {
      // Обработка ошибок аутентификации
      return {
        type: ErrorType.AUTH,
        message: ErrorHandler.getUserFriendlyMessage(error),
        shouldLogout: true
      };
    } else if (error instanceof Error && error.message.includes('Network Error')) {
      // Обработка сетевых ошибок
      return {
        type: ErrorType.NETWORK,
        message: 'Не удалось подключиться к серверу. Проверьте подключение к интернету.'
      };
    } else {
      // Обработка неизвестных ошибок
      return {
        type: ErrorType.UNKNOWN,
        message: error?.message || 'Произошла неизвестная ошибка.',
        details: error
      };
    }
  }

  /**
   * Логирование ошибки
   */
  private logError(errorResult: ErrorResult): void {
    switch (errorResult.type) {
      case ErrorType.API:
        logger.error(`API Error (${errorResult.statusCode}): ${errorResult.message}`, {
          details: errorResult.details
        });
        break;
      case ErrorType.VALIDATION:
        logger.warn(`Validation Error: ${errorResult.message}`, {
          validationErrors: errorResult.validationErrors
        });
        break;
      case ErrorType.AUTH:
        logger.error(`Auth Error: ${errorResult.message}`);
        break;
      case ErrorType.NETWORK:
        logger.error(`Network Error: ${errorResult.message}`);
        break;
      default:
        logger.error(`Unknown Error: ${errorResult.message}`, {
          details: errorResult.details
        });
    }
  }

  /**
   * Уведомление всех зарегистрированных слушателей
   */
  private notifyListeners(errorResult: ErrorResult): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorResult);
      } catch (error) {
        // Предотвращаем зацикливание ошибок в обработчиках
        logger.error('Error in error listener', { error });
      }
    });
  }
}

// Экспортируем синглтон
export const globalErrorHandler = GlobalErrorHandler.getInstance();
export default globalErrorHandler; 