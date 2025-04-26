import { Middleware, Dispatch, AnyAction } from 'redux';
import { refreshToken, logout } from '../store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { AppDispatch } from '../store';

interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
}

/**
 * Middleware для автоматического обновления токена
 * и выхода из системы при истечении срока действия токена
 */
export const authMiddleware: Middleware = ({ dispatch, getState }) => {
  return next => action => {
    // Пропускаем действие через middleware
    const result = next(action);
    
    // Проверяем наличие токена после обработки действия
    const state = getState();
    const token = state.auth.token;
    
    if (token) {
      try {
        // Декодируем токен, чтобы получить время истечения срока его действия
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        
        // Если срок действия токена истекает в ближайшие 5 минут
        if (decoded.exp < currentTime + 300) {
          // Обновляем токен
          (dispatch as AppDispatch)(refreshToken());
        }
        
        // Если срок действия токена уже истек, выходим из системы
        if (decoded.exp < currentTime) {
          dispatch(logout());
        }
      } catch (error) {
        // Если токен некорректный, выходим из системы
        console.error('Ошибка при декодировании токена:', error);
        dispatch(logout());
      }
    }
    
    return result;
  };
};

export default authMiddleware; 