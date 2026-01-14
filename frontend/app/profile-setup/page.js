'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileAPI } from '@/lib/profileAPI';

export default function ProfileSetupPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        display_name: '',
        review_goal_per_day: 10,
        notif_hour: 9,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'review_goal_per_day' || name === 'notif_hour'
                    ? parseInt(value, 10)
                    : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await profileAPI.updateUserProfile(formData);
            // Redirect to dashboard after successful profile setup
            router.push('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    err.message ||
                    'Failed to save profile'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Complete Your Profile</CardTitle>
                        <CardDescription>
                            Let&apos;s personalize your Bible study experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="display_name">
                                    Display Name
                                </Label>
                                <Input
                                    id="display_name"
                                    name="display_name"
                                    type="text"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    placeholder="Enter your display name"
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    This is how you&apos;ll appear in the app
                                </p>
                            </div>

                            {/* Review Goal Per Day */}
                            <div className="space-y-2">
                                <Label htmlFor="review_goal_per_day">
                                    Daily Review Goal (verses)
                                </Label>
                                <Input
                                    id="review_goal_per_day"
                                    name="review_goal_per_day"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.review_goal_per_day}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    How many verses do you want to review each
                                    day? (1-100)
                                </p>
                            </div>

                            {/* Notification Hour */}
                            <div className="space-y-2">
                                <Label htmlFor="notif_hour">
                                    Daily Reminder Time
                                </Label>
                                <select
                                    id="notif_hour"
                                    name="notif_hour"
                                    value={formData.notif_hour}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {Array.from({ length: 24 }, (_, i) => {
                                        let timeLabel;
                                        if (i === 0) {
                                            timeLabel = '12:00 AM';
                                        } else if (i < 12) {
                                            timeLabel = `${i}:00 AM`;
                                        } else if (i === 12) {
                                            timeLabel = '12:00 PM';
                                        } else {
                                            timeLabel = `${i - 12}:00 PM`;
                                        }
                                        return (
                                            <option key={i} value={i}>
                                                {timeLabel}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="text-sm text-gray-500">
                                    When should we remind you to study?
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? 'Saving...' : 'Continue'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
