import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            email: null,
            setTokens: (access, refresh, email) =>
                set({ accessToken: access, refreshToken: refresh, email }),
            clearTokens: () =>
                set({ accessToken: null, refreshToken: null, email: null }),
        }),
        {
            name: 'auth-storage', // key name in localStorage (optional)
        }
    )
);
