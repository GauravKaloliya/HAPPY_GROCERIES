import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    return stored === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState = {
  isDarkMode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initializeTheme: (state) => {
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    },
  },
});

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions;
export const selectIsDarkMode = (state) => state.theme.isDarkMode;
export default themeSlice.reducer;
