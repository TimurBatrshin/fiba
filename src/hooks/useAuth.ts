import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthService } from '../services/AuthService';
import { RegisterData } from '../interfaces/Auth';
import { User } from '../services/UserService';
import { setUser, setToken, clearUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import apiService from '../services/ApiService';

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
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
}

// Helper function to convert from Auth role to UserService role
function mapAuthToUserRole(role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER'): 'admin' | 'user' | 'business' {
  switch (role) {
    case 'ADMIN': return 'admin';
    case 'USER': return 'user';
    case 'COACH':
    case 'ORGANIZER':
    default:
      return 'business';
  }
}

// Helper function to convert between interfaces/Auth.User to services/UserService.User
function convertToUserServiceUser(user: any): User {
  return {
    id: user.id,
    username: user.name || user.username || '',
    email: user.email,
    role: mapAuthToUserRole(user.role),
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
    avatar: user.avatar,
    teams: user.teams,
    tournaments_played: user.tournaments_played,
    total_points: user.total_points,
    rating: user.rating
  };
}

// Helper function to convert UserService.User data to format expected by API
function convertToApiUser(userData: Partial<User>): any {
  // Map fields that need conversion
  const result: any = { ...userData };
  
  // Map role if present
  if (userData.role) {
    switch (userData.role) {
      case 'admin': result.role = 'ADMIN'; break;
      case 'user': result.role = 'USER'; break;
      case 'business': result.role = 'COACH'; break;
    }
  }
  
  // Map username to name if present
  if (userData.username) {
    result.name = userData.username;
    delete result.username;
  }
  
  return result;
}

export function useAuth(): UseAuthResult {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state.auth as AuthState).user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const authService = AuthService.getInstance();

  // Register the authService globally for token refresh handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.authService = {
        refreshToken: async () => {
          await authService.refreshToken();
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
          const currentUser = await authService.getCurrentUser();
          // Convert to UserService.User format
          const userForStore = convertToUserServiceUser(currentUser);
          dispatch(setUser(userForStore));
        } catch (err) {
          console.error('Failed to load user:', err);
          // Clear token if user load fails
          authService.clearAuthToken();
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Only try to load user if we have a token
    if (authService.getToken()) {
      loadUser();
    }
  }, [dispatch, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(email, password);
        if (response && response.token) {
          dispatch(setToken(response.token));
          // Create user object from response and convert to UserService.User format
          const userForStore = convertToUserServiceUser({
            id: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          });
          dispatch(setUser(userForStore));
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
          // Create user object from response and convert to UserService.User format
          const userForStore = convertToUserServiceUser({
            id: response.userId,
            name: response.name,
            email: response.email,
            role: response.role
          });
          dispatch(setUser(userForStore));
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
    async (id: string, userData: Partial<User>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Convert to format expected by API
        const apiUserData = convertToApiUser(userData);
        
        // Call API
        const updatedUserFromApi = await apiService.updateUser(id, apiUserData);
        
        // Convert response to UserService.User format
        const userForStore = convertToUserServiceUser(updatedUserFromApi);
        
        dispatch(setUser(userForStore));
        return userForStore;
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