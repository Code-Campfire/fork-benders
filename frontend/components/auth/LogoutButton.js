'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';

export default function LogoutButton({ className = '' }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const { clearAuth } = useAuthStore();

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await authAPI.logout();
        } catch {
            // Ignore logout errors, clear auth anyway
        } finally {
            clearAuth();
            router.push('/login');
            setIsLoggingOut(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 ${className}`}
        >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
    );
}
