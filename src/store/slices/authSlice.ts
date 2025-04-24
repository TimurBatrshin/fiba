import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// Интерфейс ошибки от API
interface ApiError {
  message: string;
  status: number;
  data: any;
}

// Пользовательский интерфейс
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

// Состояние авторизации
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  lastLoginAttempt: string | null;
}

// Начальное состояние
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
  lastLoginAttempt: null,
};

// Асинхронное действие для входа в систему
export const login = createAsyncThunk<
  any,
  { email: string; password: string },
  { rejectValue: ApiError }
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Асинхронное действие для регистрации
export const register = createAsyncThunk<
  any,
  { name: string; email: string; password: string; role?: string },
  { rejectValue: ApiError }
>(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await authService.register(name, email, password, role);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Асинхронное действие для обновления токена
export const refreshToken = createAsyncThunk<any, void, { rejectValue: ApiError }>(
  'auth/refreshToken', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// Slice для авторизации
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Прямая установка пользователя
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    // Прямая установка токена
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    // Полная очистка пользовательских данных
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    // Выход из системы
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
    // Обновление пользовательских данных
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка входа
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
      
      // Обработка регистрации
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
      
      // Обработка обновления токена
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
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError, updateUser, setUser, setToken, clearUser } = authSlice.actions;
export default authSlice.reducer; 