import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../interfaces/Auth';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
          setCurrentRole(user.role);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setCurrentRole(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setCurrentUser(null);
        setCurrentRole(null);
        setIsAuthenticated(false);
      }
    };

    // Run initial check
    checkAuth();

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'auth_token' || e.key === 'fiba_auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authService]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    // Token is stored inside AuthService.login
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentRole(null);
    setIsAuthenticated(false);
  };

  const register = async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password, name: username });
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