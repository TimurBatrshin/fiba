import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fixture, FixtureFilter, FixtureState } from '../../interfaces/Fixture';
import { RootState } from '../index';
import ApiService from '../../services/ApiService';

const initialState: FixtureState = {
  fixtures: [],
  loading: false,
  error: null,
  totalCount: 0,
  filter: {},
  sort: 'date',
  direction: 'asc',
  page: 1,
  pageSize: 10
};

interface FetchFixturesParams {
  page: number;
  pageSize: number;
  filter?: FixtureFilter;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export const fetchFixtures = createAsyncThunk(
  'fixtures/fetchAll',
  async (params: FetchFixturesParams, { rejectWithValue }) => {
    try {
      const response = await ApiService.get<{ data: Fixture[]; total: number }>('/fixtures', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          ...params.filter,
          sort: params.sort,
          direction: params.direction
        }
      });
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch fixtures');
    }
  }
);

const fixtureSlice = createSlice({
  name: 'fixtures',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FixtureFilter>) => {
      state.filter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
    setSort: (state, action: PayloadAction<{ sort: string; direction: 'asc' | 'desc' }>) => {
      state.sort = action.payload.sort;
      state.direction = action.payload.direction;
      state.page = 1; // Reset to first page when sort changes
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFixtures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixtures.fulfilled, (state, action: PayloadAction<{ data: Fixture[]; total: number }>) => {
        state.loading = false;
        state.fixtures = action.payload.data;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchFixtures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilter, setSort, setPage, setPageSize } = fixtureSlice.actions;

export const selectFixtures = (state: RootState) => state.fixtures;

export default fixtureSlice.reducer; 