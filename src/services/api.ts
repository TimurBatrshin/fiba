import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'https://timurbatrshin-fiba-backend-5ef6.twc1.net/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const customError = {
      message: 'Произошла непредвиденная ошибка',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };

    // Handle common authorization errors
    if (error.response?.status === 401) {
      customError.message = 'Ошибка авторизации. Пожалуйста, войдите снова';
      localStorage.removeItem('token');
    }

    // Handle access denied errors
    if (error.response?.status === 403) {
      customError.message = 'Доступ запрещен';
    }

    // Handle server errors
    if (error.response?.status === 500) {
      customError.message = 'Ошибка сервера. Попробуйте позже';
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      customError.message = 'Проверьте правильность введенных данных';
    }

    // Handle network errors
    if (!error.response) {
      customError.message = 'Нет соединения с сервером. Проверьте подключение к интернету';
    }

    return Promise.reject(customError);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Profile services
export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadPhoto: async (photo: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      const response = await api.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Tournament services
export const tournamentService = {
  getAllTournaments: async (params?: { limit?: number; sort?: string; direction?: string; upcoming?: boolean }) => {
    try {
      const response = await api.get('/tournaments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTournamentById: async (id: number) => {
    try {
      const response = await api.get(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTournamentsByStatus: async (status: string) => {
    try {
      const response = await api.get(`/tournaments/status/${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUpcomingTournaments: async () => {
    try {
      const response = await api.get('/tournaments/upcoming');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPastTournaments: async () => {
    try {
      const response = await api.get('/tournaments/past');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchTournaments: async (query: string) => {
    try {
      const response = await api.get('/tournaments/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createTournament: async (tournamentData: FormData) => {
    try {
      const response = await api.post('/tournaments', tournamentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  registerForTournament: async (tournamentId: number, teamName: string) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/register`, { team_name: teamName });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Team services
export const teamService = {
  getTeamDetails: async (registrationId: number) => {
    try {
      const response = await api.get(`/teams/${registrationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Registration services
export const registrationService = {
  getRegistrationsByCaptain: async () => {
    try {
      const response = await api.get('/registrations/captain');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getTeamsByPlayer: async () => {
    try {
      const response = await api.get('/registrations/player');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 