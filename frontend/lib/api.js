import axios from 'axios';

import { useAuthStore } from './auth-store';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});
/*
STEP 5: Before the request is sent, an Axios interceptor automatically:
  1. Reads the accessToken from Zustand store
  2. Adds it to the request header: Authorization: Bearer <token>
*/
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
/*
^^ Backend Validates Token & Links to User:
NEXT Go to Endpoint: backend/api/views.py:356-366 (habits function)
*/

// Step 8: Token Refresh (Automatic) - response interceptor BELOW
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If no config, can't retry - just reject
        if (!originalRequest) {
            return Promise.reject(error);
        }

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
// ^^ NEXT Go to Backend Handler: backend/api/views.py:153-188 (refresh_token_view)
export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    logout: () => api.post('/auth/logout/'),
    refresh: () => api.post('/auth/refresh/'),
    profile: () => api.get('/auth/profile/'),
};

export const habitAPI = {
    getAll: () => api.get('/habits/'),
    getCurrent: () => api.get('/habits/current/'),
    create: (data) => api.post('/habits/', data),
    update: (id, data) => api.put(`/habits/${id}/`, data),
    delete: (id) => api.delete(`/habits/${id}/`),
};

export const dashboardAPI = {
    get: () => api.get('/dashboard/'),
};

export default api;
