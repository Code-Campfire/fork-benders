'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/lib/auth-store';
import { healthURL } from '@/lib/config';

export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState('loading');
    const router = useRouter();
    const { isAuthenticated, isInitialized } = useAuthStore();

    const getStatusClasses = () => {
        if (connectionStatus === 'connected')
            return 'bg-green-100 text-green-700';
        if (connectionStatus === 'disconnected')
            return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isInitialized, router]);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await axios.get(`${healthURL}/`);
                if (response.data.database_connected) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (error) {
                setConnectionStatus('disconnected');
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    // Don't show landing page to authenticated users (they'll be redirected)
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold mb-6">Bible Study App</h1>
                <div className={`mb-6 p-3 rounded ${getStatusClasses()}`}>
                    {connectionStatus === 'loading' && 'Checking connection...'}
                    {connectionStatus === 'connected' &&
                        '✓ Connected to database'}
                    {connectionStatus === 'disconnected' &&
                        '✗ Connection failed'}
                </div>
                <div className="space-y-4">
                    <a
                        href="/login"
                        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                        Sign In
                    </a>
                    <a
                        href="/register"
                        className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                    >
                        Create Account
                    </a>
                </div>
            </div>
        </div>
    );
}
