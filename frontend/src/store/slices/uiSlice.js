import { createSlice } from '@reduxjs/toolkit';
import { getStoredTheme, setStoredTheme } from '../../utils/storage';

const initialState = {
  theme: getStoredTheme(), // 'light' or 'dark'
  sidebarOpen: false,
  adminSidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      setStoredTheme(state.theme);
      
      // Update DOM for Tailwind dark mode
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      setStoredTheme(state.theme);
      
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleAdminSidebar: (state) => {
      state.adminSidebarOpen = !state.adminSidebarOpen;
    },
    setAdminSidebarOpen: (state, action) => {
      state.adminSidebarOpen = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleAdminSidebar,
  setAdminSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
