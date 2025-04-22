import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthService } from '../services/AuthService';
import { RegisterData, User, UserProfile } from '../interfaces/Auth';
import { setUser, setToken, clearUser } from '../store/slices/authSlice';
import { RootState } from '../store';

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
          dispatch(setUser(currentUser));
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
        // Use AuthService's updateUserProfile method
        const updatedProfile = await authService.updateUserProfile(id, userData);
        
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