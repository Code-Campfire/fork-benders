import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: false,

            setAuth: (user, accessToken) => {
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                });
            },

            setAccessToken: (token) => {
                set({ accessToken: token });
            },

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true,
                });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setInitialized: (initialized) => {
                set({ isInitialized: initialized });
            },

            // Initialize auth state on app load
            initializeAuth: async () => {
                const { isAuthenticated, accessToken, user } = get();

                // If already authenticated and have access token + user in memory, we're good
                if (isAuthenticated && accessToken && user) {
                    set({ isInitialized: true });
                    return;
                }

                // If authenticated (from local storage) but no access token/user, try to refresh
                if (isAuthenticated && (!accessToken || !user)) {
                    set({ isLoading: true });
                    try {
                        // Import here to avoid circular dependency
                        const { authAPI } = await import('./api');

                        // Get new access token from refresh token cookie
                        const refreshResponse = await authAPI.refresh();
                        const { access_token } = refreshResponse.data;

                        // Set access token first so the profile request can use it
                        set({ accessToken: access_token });

                        // Fetch user profile
                        const profileResponse = await authAPI.profile();
                        const userData = profileResponse.data;

                        set({
                            user: userData,
                            accessToken: access_token,
                            isAuthenticated: true,
                            isLoading: false,
                            isInitialized: true,
                        });
                    } catch (error) {
                        // Refresh failed, clear auth state
                        set({
                            user: null,
                            accessToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            isInitialized: true,
                        });
                    }
                } else {
                    set({ isInitialized: true });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                // accessToken and user are NOT persisted for security - only kept in memory
                // User data is fetched fresh after token refresh
            }),
        }
    )
);
