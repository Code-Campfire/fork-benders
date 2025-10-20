import axios from 'axios';

import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry if:
        // 1. Already retried
        // 2. The request is to the refresh endpoint itself (prevent infinite loop)
        // 3. User is not authenticated (already logged out)
        const isRefreshEndpoint =
            originalRequest.url?.includes('/auth/refresh/');
        const { isAuthenticated } = useAuthStore.getState();

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshEndpoint &&
            isAuthenticated
        ) {
            originalRequest._retry = true;

            try {
                const response = await api.post('/auth/refresh/');
                const { access_token } = response.data;

                useAuthStore.getState().setAccessToken(access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    logout: () => api.post('/auth/logout/'),
    refresh: () => api.post('/auth/refresh/'),
    profile: () => api.get('/auth/profile/'),
};

export default api;
