'use client';

import LogoutButton from '../../components/auth/LogoutButton';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuthStore } from '../../lib/auth-store';

export default function DashboardPage() {
    const { user } = useAuthStore();

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
                                <p className="text-sm text-gray-500 mt-2">
                                    More features coming soon...
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
