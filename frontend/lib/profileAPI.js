// Profile management API functions using existing auth infrastructure
import api from './api';

/**
 * Get user profile (study preferences)
 */
export const getUserProfile = async () => {
    const response = await api.get('/profile/');
    return response.data;
};

/**
 * Update user profile preferences
 * @param {Object} profileData - { display_name, default_translation, review_goal_per_day, notif_hour, accessibility_json }
 */
export const updateUserProfile = async (profileData) => {
    const response = await api.patch('/profile/', profileData);
    return response.data;
};
