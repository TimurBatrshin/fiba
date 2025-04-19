import ErrorHandler, { ApiError, ValidationError, AuthError } from '../errorHandler';

describe('ErrorHandler', () => {
  describe('Error Classes', () => {
    it('should create ApiError correctly', () => {
      const error = new ApiError('API Error', 500, { reason: 'Server Error' });
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API Error');
      expect(error.status).toBe(500);
      expect(error.data).toEqual({ reason: 'Server Error' });
    });

    it('should create ValidationError correctly', () => {
      const errors = { username: 'Required field', password: 'Too short' };
      const error = new ValidationError('Validation Error', errors);
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation Error');
      expect(error.errors).toEqual(errors);
    });

    it('should create AuthError correctly', () => {
      const error = new AuthError('Authentication Error');
      
      expect(error).toBeInstanceOf(AuthError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthError');
      expect(error.message).toBe('Authentication Error');
    });

    it('should work correctly with instanceof checks', () => {
      const apiError = new ApiError('API Error', 404);
      const validationError = new ValidationError('Validation Error', {});
      const authError = new AuthError('Auth Error');
      
      expect(apiError instanceof ApiError).toBe(true);
      expect(validationError instanceof ValidationError).toBe(true);
      expect(authError instanceof AuthError).toBe(true);
      
      expect(apiError instanceof ValidationError).toBe(false);
      expect(validationError instanceof ApiError).toBe(false);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return appropriate message for API errors with different status codes', () => {
      const error400 = new ApiError('Bad Request', 400);
      const error401 = new ApiError('Unauthorized', 401);
      const error403 = new ApiError('Forbidden', 403);
      const error404 = new ApiError('Not Found', 404);
      const error500 = new ApiError('Server Error', 500);
      const error418 = new ApiError('I\'m a teapot', 418);
      
      expect(ErrorHandler.getUserFriendlyMessage(error400)).toBe('Неверный запрос. Пожалуйста, проверьте введенную информацию.');
      expect(ErrorHandler.getUserFriendlyMessage(error401)).toBe('Требуется авторизация. Пожалуйста, войдите в систему.');
      expect(ErrorHandler.getUserFriendlyMessage(error403)).toBe('У вас нет доступа к этому ресурсу.');
      expect(ErrorHandler.getUserFriendlyMessage(error404)).toBe('Запрашиваемый ресурс не найден.');
      expect(ErrorHandler.getUserFriendlyMessage(error500)).toBe('Произошла ошибка на сервере. Пожалуйста, попробуйте позже.');
      expect(ErrorHandler.getUserFriendlyMessage(error418)).toBe('I\'m a teapot');
    });

    it('should return appropriate message for validation errors', () => {
      const error = new ValidationError('Please check your input', {});
      expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Please check your input');
      
      const errorNoMessage = new ValidationError('', {});
      expect(ErrorHandler.getUserFriendlyMessage(errorNoMessage)).toBe('Пожалуйста, проверьте введенные данные.');
    });

    it('should return appropriate message for auth errors', () => {
      const error = new AuthError('Invalid credentials');
      expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Invalid credentials');
      
      const errorNoMessage = new AuthError('');
      expect(ErrorHandler.getUserFriendlyMessage(errorNoMessage)).toBe('Ошибка аутентификации. Пожалуйста, войдите снова.');
    });

    it('should handle standard JS errors', () => {
      const error = new Error('Random error');
      expect(ErrorHandler.getUserFriendlyMessage(error)).toBe('Random error');
    });

    it('should handle null/undefined errors', () => {
      expect(ErrorHandler.getUserFriendlyMessage(null)).toBe('Произошла неизвестная ошибка.');
      expect(ErrorHandler.getUserFriendlyMessage(undefined)).toBe('Произошла неизвестная ошибка.');
    });

    it('should handle error-like objects', () => {
      const errorLike = { message: 'Error-like object' };
      expect(ErrorHandler.getUserFriendlyMessage(errorLike)).toBe('Error-like object');
    });
  });

  describe('getValidationErrors', () => {
    it('should extract errors from ValidationError', () => {
      const validationErrors = { email: 'Invalid email', password: 'Too short' };
      const error = new ValidationError('Validation failed', validationErrors);
      
      expect(ErrorHandler.getValidationErrors(error)).toEqual(validationErrors);
    });

    it('should extract errors from API response object', () => {
      const validationErrors = { username: 'Already taken', email: 'Required' };
      const apiResponse = {
        response: {
          data: {
            errors: validationErrors
          }
        }
      };
      
      expect(ErrorHandler.getValidationErrors(apiResponse)).toEqual(validationErrors);
    });

    it('should return empty object for non-validation errors', () => {
      const error = new Error('Generic error');
      expect(ErrorHandler.getValidationErrors(error)).toEqual({});
      
      const apiError = new ApiError('API error', 500);
      expect(ErrorHandler.getValidationErrors(apiError)).toEqual({});
      
      const authError = new AuthError('Auth error');
      expect(ErrorHandler.getValidationErrors(authError)).toEqual({});
    });

    it('should handle malformed API responses', () => {
      expect(ErrorHandler.getValidationErrors({})).toEqual({});
      expect(ErrorHandler.getValidationErrors({ response: {} })).toEqual({});
      expect(ErrorHandler.getValidationErrors({ response: { data: {} } })).toEqual({});
      expect(ErrorHandler.getValidationErrors(null)).toEqual({});
      expect(ErrorHandler.getValidationErrors(undefined)).toEqual({});
    });
  });

  describe('throwFromResponse', () => {
    it('should throw ValidationError for 400 responses with errors', () => {
      const response = {
        status: 400,
        data: {
          message: 'Validation failed',
          errors: { email: 'Invalid format' }
        }
      };
      
      expect(() => {
        ErrorHandler.throwFromResponse(response);
      }).toThrow(ValidationError);
      
      try {
        ErrorHandler.throwFromResponse(response);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).errors).toEqual({ email: 'Invalid format' });
        expect(error.message).toBe('Validation failed');
      }
    });

    it('should throw AuthError for 401 responses', () => {
      const response = {
        status: 401,
        data: { message: 'Unauthorized' }
      };
      
      expect(() => {
        ErrorHandler.throwFromResponse(response);
      }).toThrow(AuthError);
      
      try {
        ErrorHandler.throwFromResponse(response);
      } catch (error: any) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe('Unauthorized');
      }
    });

    it('should throw AuthError for 403 responses', () => {
      const response = {
        status: 403,
        data: { message: 'Forbidden' }
      };
      
      expect(() => {
        ErrorHandler.throwFromResponse(response);
      }).toThrow(AuthError);
      
      try {
        ErrorHandler.throwFromResponse(response);
      } catch (error: any) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe('Forbidden');
      }
    });

    it('should throw ApiError for other responses', () => {
      const response = {
        status: 500,
        data: { message: 'Server error' }
      };
      
      expect(() => {
        ErrorHandler.throwFromResponse(response);
      }).toThrow(ApiError);
      
      try {
        ErrorHandler.throwFromResponse(response);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Server error');
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).data).toEqual({ message: 'Server error' });
      }
    });

    it('should use fallback messages when none are provided', () => {
      const validationResponse = { status: 400, data: { errors: { field: 'error' } } };
      const authResponse = { status: 401, data: {} };
      const apiResponse = { status: 404, data: {} };
      
      try {
        ErrorHandler.throwFromResponse(validationResponse);
      } catch (error: any) {
        expect(error.message).toBe('Validation failed');
      }
      
      try {
        ErrorHandler.throwFromResponse(authResponse);
      } catch (error: any) {
        expect(error.message).toBe('Authentication failed');
      }
      
      try {
        ErrorHandler.throwFromResponse(apiResponse);
      } catch (error: any) {
        expect(error.message).toBe('API request failed');
      }
    });
  });
}); 