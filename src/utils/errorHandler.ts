/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    // Исправляем прототип для правильной работы instanceof
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  errors: { [key: string]: string };

  constructor(message: string, errors: { [key: string]: string }) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;

    // Исправляем прототип для правильной работы instanceof
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';

    // Исправляем прототип для правильной работы instanceof
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Custom error class for network errors including CORS
 */
export class NetworkError extends Error {
  originalError: any;
  
  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    
    // Исправляем прототип для правильной работы instanceof
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error handler utility functions
 */
export const ErrorHandler = {
  /**
   * Returns a user-friendly error message based on error type
   */
  getUserFriendlyMessage(error: any): string {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return 'Неверный запрос. Пожалуйста, проверьте введенную информацию.';
        case 401:
          return 'Требуется авторизация. Пожалуйста, войдите в систему.';
        case 403:
          return 'У вас нет доступа к этому ресурсу.';
        case 404:
          return 'Запрашиваемый ресурс не найден.';
        case 500:
          return 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.';
        default:
          return error.message || 'Произошла неизвестная ошибка.';
      }
    } else if (error instanceof ValidationError) {
      return error.message || 'Пожалуйста, проверьте введенные данные.';
    } else if (error instanceof AuthError) {
      return error.message || 'Ошибка аутентификации. Пожалуйста, войдите снова.';
    } else if (error instanceof NetworkError) {
      return 'Проблема с сетевым соединением. Проверьте подключение к интернету или возможные проблемы с CORS.';
    } else {
      return error?.message || 'Произошла неизвестная ошибка.';
    }
  },

  /**
   * Returns validation errors formatted for form fields
   */
  getValidationErrors(error: any): { [key: string]: string } {
    if (error instanceof ValidationError) {
      return error.errors;
    }
    
    if (error?.response?.data?.errors) {
      return error.response.data.errors;
    }
    
    return {};
  },

  /**
   * Throws an appropriate error based on the API response
   */
  throwFromResponse(response: any): never {
    if (!response) {
      throw new NetworkError('Network error occurred');
    }
    
    if (response.status === 400 && response.data?.errors) {
      throw new ValidationError(
        response.data.message || 'Validation failed',
        response.data.errors
      );
    } else if (response.status === 401 || response.status === 403) {
      throw new AuthError(
        response.data?.message || 'Authentication failed'
      );
    } else {
      throw new ApiError(
        response.data?.message || 'API request failed',
        response.status,
        response.data
      );
    }
  },
  
  /**
   * Создает соответствующую ошибку на основе HTTP-ошибки Axios
   */
  createFromAxiosError(error: any): Error {
    if (!error.response) {
      return new NetworkError(
        'Сетевая ошибка или проблема с CORS', 
        error
      );
    }

    const { status, data } = error.response;
    
    if (status === 400 && data?.errors) {
      return new ValidationError(
        data.message || 'Ошибка валидации', 
        data.errors
      );
    } else if (status === 401 || status === 403) {
      return new AuthError(
        data?.message || 'Ошибка авторизации'
      );
    } else {
      return new ApiError(
        data?.message || 'Ошибка API', 
        status, 
        data
      );
    }
  }
};

export default ErrorHandler; 