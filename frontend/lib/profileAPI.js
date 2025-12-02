import api from './api';

/**
 * Profile API client for managing user profile, settings, and account security
 */
export const profileAPI = {
    /**
     * Get user profile (includes UserProfile + CustomUser data)
     * Cached for offline viewing
     * @returns {Promise} Profile data including email, avatar, display_name, etc.
     */
    getUserProfile: async () => {
        return api.get('/profile/');
    },

    /**
     * Update user profile (PATCH for partial updates)
     * Requires online connection
     * @param {Object} data - Profile fields to update
     * @param {string} [data.display_name] - User's display name
     * @param {number} [data.review_goal_per_day] - Daily review goal (1-100)
     * @param {number} [data.notif_hour] - Notification hour (0-23)
     * @param {Object} [data.accessibility_json] - Accessibility settings
     * @returns {Promise} Updated profile data
     */
    updateUserProfile: async (data) => {
        if (!navigator.onLine) {
            throw new Error('You must be online to update your profile');
        }
        return api.patch('/profile/', data);
    },

    /**
     * Upload avatar image
     * Requires online connection
     * @param {File} file - Image file (JPEG, PNG, GIF, or WEBP, max 5MB)
     * @returns {Promise} Response with avatar_url
     */
    uploadAvatar: async (file) => {
        if (!navigator.onLine) {
            throw new Error('You must be online to upload an avatar');
        }

        const formData = new FormData();
        formData.append('avatar', file);

        return api.post('/profile/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
