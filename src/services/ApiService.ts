import { BaseApiService } from './BaseApiService';
import { API_CONFIG } from '../config/api';
import { ErrorHandler, ApiError, ValidationError, AuthError } from '../utils/errorHandler';
import logger from '../utils/logger';

/**
 * Сервис для работы с API
 */
export class ApiService extends BaseApiService {
  private static instance: ApiService;

  private constructor() {
    super(API_CONFIG.baseUrl);
    
    // Инициализировать токен из хранилища
    const token = localStorage.getItem('fiba_auth_token') || localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
    }
  }
  
  /**
   * Получить экземпляр сервиса (Singleton)
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  /**
   * Обработчик ошибок
   */
  protected handleError(error: any): void {
    // Добавляем специфичную для приложения логику обработки ошибок
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          logger.warn('Bad Request', { data: error.data });
          break;
        case 403:
          logger.warn('Forbidden Access', { data: error.data });
          break;
        case 404:
          logger.warn('Resource Not Found');
          break;
        case 500:
          logger.error('Server Error', { data: error.data });
          break;
      }
    } else if (error instanceof ValidationError) {
      logger.warn('Validation Error', { errors: error.errors });
    } else if (error instanceof AuthError) {
      logger.warn('Auth Error', { message: error.message });
    }
  }
  
  /**
   * Возвращает понятное пользователю сообщение об ошибке
   */
  public getErrorMessage(error: any): string {
    return ErrorHandler.getUserFriendlyMessage(error);
  }
  
  /**
   * Возвращает ошибки валидации для полей формы
   */
  public getValidationErrors(error: any): { [key: string]: string } {
    return ErrorHandler.getValidationErrors(error);
  }
}

// Экспортируем экземпляр для упрощения импорта
export default ApiService.getInstance(); 