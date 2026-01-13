'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import LogoutButton from '../../components/auth/LogoutButton';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import HabitReminderModal from '../../components/habits/HabitReminderModal.js';
import { habitAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import { profileAPI } from '../../lib/profileAPI';

export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuthStore();
    const router = useRouter();

    // Check profile completion, then habits
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                // First, check if profile is complete
                const profileResponse = await profileAPI.getUserProfile();
                const profile = profileResponse.data;

                // Profile is incomplete if display_name is missing
                const isProfileIncomplete =
                    !profile.display_name || profile.display_name.trim() === '';

                if (isProfileIncomplete) {
                    // Redirect to profile setup
                    router.push('/profile-setup');
                    return;
                }

                // Profile is complete, now check for habits
                const habitsResponse = await habitAPI.getAll();
                const habits = habitsResponse.data;

                // If user has no habits, open the modal
                if (habits.length === 0) {
                    setIsModalOpen(true);
                }
            } catch {
                // Don't redirect or open modal on error - let user manually navigate
            }
        };

        checkOnboarding();
    }, [router]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold">
                                    Bible Study App
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">
                                    Welcome, {user?.email}
                                </span>
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Dashboard
                                </h2>
                                <p className="text-gray-600">
                                    Welcome to your Bible study dashboard!
                                </p>
                                <p className="text-gray-600 mt-2">
                                    User habit display goes here
                                </p>
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-green-500 text-white p-4 rounded-lg shadow-lg mt-4"
                                >
                                    Open Habit Modal
                                </Button>
                                <HabitReminderModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    More features coming soon...
                                </p>
                            </div>
                            <div />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
