import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants/storage';
import { authService } from '../../services/auth.service';

// API Error interface
interface ApiError {
  message: string;
  status: number;
  data: any;
}

// User interface
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Auth state interface
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  lastLoginAttempt: string | null;
}

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  user: null,
  loading: false,
  error: null,
  lastLoginAttempt: null,
};

// Async thunk for login
export const login = createAsyncThunk<
  any,
  { email: string; password: string },
  { rejectValue: ApiError }
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for registration
export const register = createAsyncThunk<
  any,
  { name: string; email: string; password: string; role?: string },
  { rejectValue: ApiError }
>(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await authService.register(name, email, password, role);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for token refresh
export const refreshToken = createAsyncThunk<any, void, { rejectValue: ApiError }>(
  'auth/refreshToken', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastLoginAttempt = action.meta.arg.email;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.message || 'Ошибка входа';
        } else {
          state.error = 'Не удалось войти. Проверьте соединение с интернетом';
        }
      })
      
      // Registration cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.message || 'Ошибка регистрации';
        } else {
          state.error = 'Не удалось зарегистрироваться. Проверьте соединение с интернетом';
        }
      })
      
      // Token refresh cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.userId,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role,
        };
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload.message || 'Не удалось обновить токен';
        } else {
          state.error = 'Ошибка авторизации. Пожалуйста, войдите снова';
        }
        state.token = null;
        state.user = null;
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      });
  },
});

export const { logout, clearError, updateUser, setUser, setToken, clearUser } = authSlice.actions;
export default authSlice.reducer; 