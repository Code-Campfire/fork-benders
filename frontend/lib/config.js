const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const config = {
    baseURL: BASE_URL,
    apiURL: `${BASE_URL}/api`,
    authURL: `${BASE_URL}/auth`,
    healthURL: `${BASE_URL}/api/health`,
    adminURL: `${BASE_URL}/admin`,
};

// Named exports for explicit imports
export const apiURL = config.apiURL;
export const authURL = config.authURL;
export const healthURL = config.healthURL;
export const baseURL = config.baseURL;
export const adminURL = config.adminURL;
