import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  toasts: ToastMessage[];
  isMenuOpen: boolean;
  isDropdownOpen: boolean;
  isDarkMode: boolean;
}

const initialState: UIState = {
  toasts: [],
  isMenuOpen: false,
  isDropdownOpen: false,
  isDarkMode: localStorage.getItem('darkMode') === 'true',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    closeMenu: (state) => {
      state.isMenuOpen = false;
    },
    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },
    closeDropdown: (state) => {
      state.isDropdownOpen = false;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      
      // Применяем тему к документу
      if (state.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    },
  },
});

export const { 
  addToast, 
  removeToast, 
  toggleMenu, 
  closeMenu, 
  toggleDropdown, 
  closeDropdown,
  toggleDarkMode 
} = uiSlice.actions;

export default uiSlice.reducer; 