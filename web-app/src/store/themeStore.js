import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        set({ theme: newTheme });
      },

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      initTheme: () => {
        const savedTheme = get().theme;
        document.documentElement.setAttribute('data-theme', savedTheme);
      },
    }),
    {
      name: 'amk-theme',
    }
  )
);

export default useThemeStore;
