import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Интерфейс для ошибки
interface ErrorState {
  message: string | null;
  statusCode?: number;
  isVisible: boolean;
}

const initialState: ErrorState = {
  message: null,
  statusCode: undefined,
  isVisible: false,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<{ message: string; statusCode?: number }>) => {
      state.message = action.payload.message;
      state.statusCode = action.payload.statusCode;
      state.isVisible = true;
    },
    clearError: (state) => {
      state.message = null;
      state.statusCode = undefined;
      state.isVisible = false;
    },
    hideError: (state) => {
      state.isVisible = false;
    },
  },
});

export const { setError, clearError, hideError } = errorSlice.actions;
export default errorSlice.reducer; 