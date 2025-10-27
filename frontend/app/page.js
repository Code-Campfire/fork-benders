'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';


import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState('loading');

    const getStatusClasses = () => {
        if (connectionStatus === 'connected')
            return 'bg-green-100 text-green-700';
        if (connectionStatus === 'disconnected')
            return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await axios.get(`${baseUrl}/api/health/`);
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
                    <a
                        href="/dashboard"
                        className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                    >
                        Dashboard
                    </a>
                    <GoogleLoginButton />
                </div>

                <div className="mt-8">
                    <Button className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
                        Tailwind v3 is working!!!
                    </Button>
                </div>

                <Card className="bg-bible-gold h-20 flex items-center p-3 m-3 mt-4">
                    <p className="text-red-700">
                        This is a shadcn/ui Card component
                    </p>
                </Card>
            </div>
        </div>
    );
}
