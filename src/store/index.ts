import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tournamentReducer from './slices/tournamentSlice';
import errorReducer from './slices/errorSlice';
import authMiddleware from '../utils/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tournaments: tournamentReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(authMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 