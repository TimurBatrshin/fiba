import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../interfaces/Auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, logoutUser, registerUser, checkAndLoadUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Хелперы для безопасного доступа к Redux
const safeDispatch = () => {
  try {
    return useAppDispatch();
  } catch (error) {
    // Если Provider не найден, возвращаем функцию-заглушку
    return (() => {}) as any;
  }
};

const safeSelector = <T extends unknown>(selector: (state: any) => T, defaultValue: T): T => {
  try {
    return useAppSelector(selector);
  } catch (error) {
    // Если Provider не найден, возвращаем значение по умолчанию
    return defaultValue;
  }
};

// Компонент-обертка для обхода проблемы использования хуков в функции
const AuthProviderWithRedux: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = safeDispatch();
  
  // Используем состояние из Redux с защитой от ошибок
  const { isAuthenticated, currentUser, currentRole, error } = safeSelector(state => state.auth, {
    isAuthenticated: false,
    currentUser: null,
    currentRole: null,
    error: null
  });
  
  const authService = AuthService.getInstance();
  
  // Инициализация при запуске компонента
  useEffect(() => {
    try {
      dispatch(checkAndLoadUser());
    } catch (error) {
      console.error('Failed to dispatch checkAndLoadUser:', error);
    }
  }, [dispatch]);
  
  // Теперь мы не используем локальное состояние, а берем из Redux
  // Но для обратной совместимости по-прежнему можем поддерживать интерфейс AuthContext

  useEffect(() => {
    // Показываем ошибки аутентификации как уведомления
    if (error) {
      dispatch(addToast({
        type: 'error',
        message: error
      }));
    }
  }, [error, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      // Используем Redux-действие вместо прямого вызова сервиса
      await dispatch(loginUser({ email, password })).unwrap();
      
      // Уведомление об успешном входе
      dispatch(addToast({
        type: 'success',
        message: 'Вы успешно вошли в систему'
      }));
    } catch (error) {
      // Ошибки обрабатываются в редьюсере и показываются через useEffect выше
    }
  };

  const logout = () => {
    // Используем Redux-действие
    dispatch(logoutUser());
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // Используем Redux-действие
      await dispatch(registerUser({ username, email, password, name: username })).unwrap();
      
      // Уведомление об успешной регистрации
      dispatch(addToast({
        type: 'success',
        message: 'Регистрация успешно завершена. Теперь вы можете войти.'
      }));
    } catch (error) {
      // Ошибки обрабатываются в редьюсере и показываются через useEffect выше
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentRole,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Экспортируем обертку как основной компонент
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProviderWithRedux>{children}</AuthProviderWithRedux>;
}; 