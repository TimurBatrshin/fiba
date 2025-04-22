import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import userService, { User } from '../services/UserService';
import { setUser, setToken, clearUser } from '../store/slices/authSlice';
import { RootState } from '../store';

interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<any>;
  register: (firstName: string, email: string, password: string, lastName?: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<User>;
}

export function useAuth(): UseAuthResult {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => (state as any).auth.user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        try {
          setIsLoading(true);
          const currentUser = await userService.getCurrentUser();
          dispatch(setUser(currentUser));
        } catch (err) {
          console.error('Failed to load user:', err);
          // Clear token if user load fails
          localStorage.removeItem('token');
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Only try to load user if we have a token
    if (localStorage.getItem('token')) {
      loadUser();
    }
  }, [dispatch, user]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userService.login(email, password);
        if (response && response.token) {
          dispatch(setToken(response.token));
          // Get the user data
          const userData = await userService.getCurrentUser();
          dispatch(setUser(userData));
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
    async (firstName: string, email: string, password: string, lastName: string = '') => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userService.register(firstName, email, password, lastName);
        if (response && response.token) {
          dispatch(setToken(response.token));
          // Get the user data
          const userData = await userService.getCurrentUser();
          dispatch(setUser(userData));
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
      await userService.logout();
      dispatch(clearUser());
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const updateUser = useCallback(
    async (id: string, userData: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedUser = await userService.updateUser(id, userData);
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