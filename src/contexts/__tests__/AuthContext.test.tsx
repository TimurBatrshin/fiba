import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthService } from '../../services/AuthService';
import { User } from '../../interfaces/Auth';

// Mock AuthService
jest.mock('../../services/AuthService', () => {
  return {
    AuthService: {
      getInstance: jest.fn(() => ({
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        isAuthenticated: jest.fn(),
        getCurrentUser: jest.fn(),
        getCurrentUserRole: jest.fn(),
      })),
    }
  };
});

// Interface for wrapper props
interface WrapperProps {
  children: React.ReactNode;
}

describe('AuthContext', () => {
  // Get mock functions from AuthService for assertions
  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    getCurrentUserRole: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure AuthService mock functions
    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });
  
  describe('AuthProvider', () => {
    it('renders children correctly', () => {
      render(
        <AuthProvider>
          <div data-testid="test-child">Test Child</div>
        </AuthProvider>
      );
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
    
    it('initializes with unauthenticated state', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>,
      });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.currentUser).toBeNull();
      expect(result.current.currentRole).toBeNull();
    });
    
    it('initializes with authenticated state when valid token exists', () => {
      // Mock authenticated user
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER'
      };
      
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>,
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.currentRole).toBe('USER');
    });
  });
  
  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Test that useAuth throws an error when used outside of the AuthProvider
      const { result } = renderHook(() => useAuth());
      expect(result.error).toEqual(
        Error('useAuth must be used within an AuthProvider')
      );
    });
    
    it('provides login function that updates auth state', async () => {
      // Set initial state as unauthenticated
      mockAuthService.isAuthenticated.mockReturnValue(false);
      
      // Configure mocks for successful login
      mockAuthService.login.mockResolvedValue({
        token: 'mock-token',
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' }
      });
      
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER'
      };
      
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>,
      });
      
      // Initially user is not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      
      // After successful login, change isAuthenticated mock
      mockAuthService.isAuthenticated.mockReturnValue(true);
      
      // Call login function
      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });
      
      // Verify login method was called with correct parameters
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
      
      // Verify authentication state updated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.currentRole).toBe('USER');
    });
    
    it('provides logout function that clears auth state', async () => {
      // Configure initial state as authenticated
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER'
      };
      
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>,
      });
      
      // Initially user is authenticated
      expect(result.current.isAuthenticated).toBe(true);
      
      // After logout, change isAuthenticated mock
      mockAuthService.isAuthenticated.mockReturnValue(false);
      
      // Call logout function
      act(() => {
        result.current.logout();
      });
      
      // Verify logout method was called
      expect(mockAuthService.logout).toHaveBeenCalled();
      
      // Verify authentication state cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.currentUser).toBeNull();
      expect(result.current.currentRole).toBeNull();
    });
    
    it('provides register function that calls AuthService', async () => {
      mockAuthService.register.mockResolvedValue({});
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>,
      });
      
      // Call register function
      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password');
      });
      
      // Verify register method was called with correct parameters
      expect(mockAuthService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        name: 'testuser'
      });
    });
  });
}); 