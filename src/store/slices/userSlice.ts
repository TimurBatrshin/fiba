import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '../../services/ApiService';
import { PlayerStatistics } from '../../interfaces/PlayerStatistics';

interface UserState {
  profile: any | null;
  statistics: PlayerStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  statistics: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get('/users/profile');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить профиль пользователя.');
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'user/fetchStatistics',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(`/users/${userId}/statistics`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить статистику пользователя.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Statistics
    builder.addCase(fetchUserStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserStatistics.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.statistics = action.payload;
    });
    builder.addCase(fetchUserStatistics.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer; 