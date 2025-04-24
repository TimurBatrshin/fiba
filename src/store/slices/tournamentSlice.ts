import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import tournamentService from '../../services/tournament.service';
import { Tournament } from '../../interfaces/Tournament';
import { RootState } from '../index';

// Define a type for the slice state
interface TournamentState {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  currentTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  registrationError: string | null;
  filter?: {
    status?: string;
    search?: string;
    sort?: string;
    direction?: string;
  };
  totalCount?: number;
}

// Define the initial state using that type
const initialState: TournamentState = {
  tournaments: [],
  activeTournament: null,
  currentTournament: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  registrationError: null,
  filter: {
    status: undefined,
    search: undefined,
    sort: 'date',
    direction: 'asc',
  },
};

export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const data = await tournamentService.getAllTournaments(params);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tournaments');
    }
  }
);

export const fetchUpcomingTournaments = createAsyncThunk(
  'tournaments/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const data = await tournamentService.getUpcomingTournaments();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch upcoming tournaments');
    }
  }
);

export const fetchPastTournaments = createAsyncThunk(
  'tournaments/fetchPast',
  async (_, { rejectWithValue }) => {
    try {
      const data = await tournamentService.getPastTournaments();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch past tournaments');
    }
  }
);

export const fetchTournamentById = createAsyncThunk(
  'tournaments/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await tournamentService.getTournamentById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tournament');
    }
  }
);

export const registerForTournament = createAsyncThunk(
  'tournaments/register',
  async ({ tournamentId, teamName, playerIds }: { tournamentId: number, teamName: string, playerIds?: string[] | undefined }, { rejectWithValue }) => {
    try {
      await tournamentService.registerForTournament(tournamentId, teamName);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to register for tournament');
    }
  }
);

export const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    clearActiveTournament: (state) => {
      state.activeTournament = null;
    },
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
    },
    resetRegistrationState: (state) => {
      state.registrationSuccess = false;
      state.registrationError = null;
    },
    setFilter: (state, action: PayloadAction<Partial<TournamentState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilters: (state) => {
      state.filter = {
        status: undefined,
        search: undefined,
        sort: 'date',
        direction: 'asc',
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action: PayloadAction<Tournament[]>) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch upcoming tournaments
      .addCase(fetchUpcomingTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingTournaments.fulfilled, (state, action: PayloadAction<Tournament[]>) => {
        state.loading = false;
        state.tournaments = action.payload;
        state.filter = { ...state.filter, status: 'UPCOMING' };
      })
      .addCase(fetchUpcomingTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch past tournaments
      .addCase(fetchPastTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPastTournaments.fulfilled, (state, action: PayloadAction<Tournament[]>) => {
        state.loading = false;
        state.tournaments = action.payload;
        state.filter = { ...state.filter, status: 'PAST' };
      })
      .addCase(fetchPastTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tournament by ID
      .addCase(fetchTournamentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action: PayloadAction<Tournament>) => {
        state.loading = false;
        state.activeTournament = action.payload;
        state.currentTournament = action.payload;
      })
      .addCase(fetchTournamentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register for tournament
      .addCase(registerForTournament.pending, (state) => {
        state.loading = true;
        state.registrationSuccess = false;
        state.registrationError = null;
      })
      .addCase(registerForTournament.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload as string;
      });
  },
});

export const { 
  clearActiveTournament, 
  clearCurrentTournament,
  resetRegistrationState,
  setFilter,
  clearFilters,
  clearError
} = tournamentSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTournaments = (state: RootState) => state.tournaments.tournaments;
export const selectActiveTournament = (state: RootState) => state.tournaments.activeTournament;
export const selectCurrentTournament = (state: RootState) => state.tournaments.currentTournament;
export const selectTournamentsLoading = (state: RootState) => state.tournaments.loading;
export const selectTournamentsError = (state: RootState) => state.tournaments.error;
export const selectRegistrationSuccess = (state: RootState) => state.tournaments.registrationSuccess;
export const selectRegistrationError = (state: RootState) => state.tournaments.registrationError;
export const selectFilter = (state: RootState) => state.tournaments.filter;

export default tournamentSlice.reducer; 