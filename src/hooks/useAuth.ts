import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RegisterData, User, UserProfile } from '../interfaces/Auth';
import { setUser, setToken, clearUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import { ServiceFactory } from '../services/serviceFactory';

// Create an interface for the auth slice state
interface AuthState {
  user: User | null;
  token: string | null;
}

// Define window.authService interface
declare global {
  interface Window {
    authService?: {
      refreshToken: () => Promise<void>;
    };
  }
}

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (id: string, userData: Partial<UserProfile>) => Promise<User>;
}

export function useAuth(): UseAuthResult {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state.auth as AuthState).user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const authService = ServiceFactory.getAuthService();

  // Register the authService globally for token refresh handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.authService = {
        refreshToken: async () => {
          // Call refreshToken if it exists on the authService
          if ('refreshToken' in authService) {
            await (authService as any).refreshToken();
          }
        }
      };
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        try {
          setIsLoading(true);
          
          // Проверяем, что токен существует перед загрузкой пользователя
          const token = authService.getToken();
          if (!token) {
            // Если токена нет, тихо завершаем операцию без ошибок
            console.log('No authentication token found, skipping user load');
            setIsLoading(false);
            return;
          }
          
          // Проверка валидности токена и его срока действия без вызова запросов к API
          try {
            if (!authService.isAuthenticated()) {
              console.warn('Token found but not valid, clearing user state');
              // Просто очищаем состояние пользователя без перенаправления
              dispatch(clearUser());
              setIsLoading(false);
              return;
            }
          } catch (authError) {
            console.error('Error checking token validity:', authError);
            dispatch(clearUser());
            setIsLoading(false);
            return;
          }
          
          console.log('Token valid, loading user data');
          
          try {
            // Используем локальные данные без запроса к API
            const userService = ServiceFactory.getUserService();
            const currentUser = await userService.getCurrentUser();
            
            // Проверка данных пользователя
            if (!currentUser) {
              console.error("User data not received");
              setIsLoading(false);
              return;
            }
            
            console.log('User loaded successfully:', currentUser.id);
            dispatch(setUser(currentUser));
            
            // Обновляем токен в сторе для синхронизации
            dispatch(setToken(token));
          } catch (userError) {
            console.error('Failed to load user details:', userError);
            // Не очищаем состояние пользователя здесь, чтобы не вызвать перенаправление
          }
        } catch (err) {
          console.error('Critical error in load user effect:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUser();
  }, [dispatch, user, authService]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(email, password);
        if (response && response.token) {
          dispatch(setToken(response.token));
          const currentUser: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          };
          dispatch(setUser(currentUser));
        }
        return response;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const registerData: RegisterData = { name, email, password };
        const response = await authService.register(registerData);
        if (response && response.token) {
          dispatch(setToken(response.token));
          const currentUser: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          };
          dispatch(setUser(currentUser));
        }
        return response;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      authService.logout();
      dispatch(clearUser());
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const updateUser = useCallback(
    async (id: string, userData: Partial<UserProfile>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use AuthService's updateUserProfile method if it exists
        if ('updateUserProfile' in authService) {
          const updatedProfile = await (authService as any).updateUserProfile(id, userData);
        } else {
          console.warn('Auth service does not have updateUserProfile method');
        }
        
        // Get the updated user data
        const updatedUser = await authService.getCurrentUser();
        
        // Update the user in the store
        dispatch(setUser(updatedUser));
        return updatedUser;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
  };
}