import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { User } from '../interfaces/Auth';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: string | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (firstName: string, email: string, password: string, lastName?: string) => Promise<any>;
  updateUser: (id: string, userData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser
  } = useAuthHook();

  // Проверяем и нормализуем роль пользователя
  let normalizedRole: string | null = null;
  
  if (user && user.role) {
    // Приводим роль к верхнему регистру и удаляем пробелы
    normalizedRole = user.role.toString().trim().toUpperCase();
    console.log(`Auth context: Normalized user role from "${user.role}" to "${normalizedRole}"`);
  }
  
  const isAuthenticated = !!user;
  const currentRole = normalizedRole;
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser: user,
        currentRole,
        isLoading,
        error,
        login,
        logout,
        register,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 