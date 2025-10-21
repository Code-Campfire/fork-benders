'use client';

import { useEffect } from 'react';

import { useAuthStore } from '../../lib/auth-store';

export default function AuthProvider({ children }) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const isInitialized = useAuthStore((state) => state.isInitialized);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Show nothing while initializing to prevent flash of unauthenticated content
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return children;
}
