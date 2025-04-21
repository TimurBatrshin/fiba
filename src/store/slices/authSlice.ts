import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';
import { User, LoginCredentials, RegisterData } from '../../interfaces/Auth';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('token') || false,
  currentUser: null,
  currentRole: null,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const authService = AuthService.getInstance();
      const response = await authService.login(credentials.email, credentials.password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось войти. Проверьте учетные данные.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const authService = AuthService.getInstance();
      await authService.register(userData);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось зарегистрироваться.');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const authService = AuthService.getInstance();
      authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось выйти из системы.');
    }
  }
);

export const checkAndLoadUser = createAsyncThunk(
  'auth/checkUser',
  async (_, { rejectWithValue }) => {
    try {
      const authService = AuthService.getInstance();
      if (authService.isAuthenticated()) {
        return {
          user: authService.getCurrentUser(),
          role: authService.getCurrentUserRole()
        };
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при проверке пользователя');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state) => {
      const authService = AuthService.getInstance();
      state.isAuthenticated = true;
      state.currentUser = authService.getCurrentUser();
      state.currentRole = authService.getCurrentUserRole();
      state.loading = false;
    });
    builder.addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.currentRole = null;
    });

    // Check and load user
    builder.addCase(checkAndLoadUser.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
        state.currentRole = action.payload.role;
      }
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 