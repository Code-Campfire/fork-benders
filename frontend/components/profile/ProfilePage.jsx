'use client';

import { useEffect, useState } from 'react';

import { getUserProfile, updateUserProfile } from '@/lib/profileAPI';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        display_name: '',
        review_goal_per_day: 10,
        notif_hour: null,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
            setFormData({
                display_name: data.display_name || '',
                review_goal_per_day: data.review_goal_per_day || 10,
                notif_hour: data.notif_hour || '',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await updateUserProfile(formData);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'review_goal_per_day' || name === 'notif_hour') {
            processedValue = value === '' ? null : parseInt(value, 10);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Profile updated successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Email (read-only)
                    </label>
                    <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Display Name
                    </label>
                    <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Enter display name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Daily Review Goal
                    </label>
                    <input
                        type="number"
                        name="review_goal_per_day"
                        value={formData.review_goal_per_day}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Notification Hour (0-23)
                    </label>
                    <input
                        type="number"
                        name="notif_hour"
                        value={
                            formData.notif_hour === null
                                ? ''
                                : formData.notif_hour
                        }
                        onChange={handleChange}
                        min="0"
                        max="23"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Leave empty to disable"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
