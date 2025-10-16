'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Import shadcn components here

/* Because Tailwind directives is imported in globals.css and globals is imported in Layout.tsx, you can use Tailwind CSS immediately in your code without needed to add imports.*/

export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState<
        'loading' | 'connected' | 'disconnected'
    >('loading');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/health/'
                );
                if (response.data.database_connected) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (error) {
                console.error('Error checking connection:', error);
                setConnectionStatus('disconnected');
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white-500 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-brand mb-4">
                    Hello World
                </h1>
                <div
                    className={`
                        px-4 py-2 rounded inline-block
                        ${connectionStatus === 'loading' && 'bg-blue-500 text-white'}
                        ${connectionStatus === 'connected' && 'bg-green-500 text-white'}
                        ${connectionStatus === 'disconnected' && 'bg-red-500 text-white'}
                    `}
                >
                    {connectionStatus === 'loading' && 'Checking connection...'}
                    {connectionStatus === 'connected' && 'Connected'}
                    {connectionStatus === 'disconnected' && 'Disconnected'}
                </div>
            </div>
            <Button className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
                Tailwind v3 is working!!!
            </Button>
            <Card className=" bg-bible-gold h-20 flex items-center p-3 m-3">
                <p className="text-red-700">
                    This is a shadcn/ui Card component
                </p>
            </Card>
        </div>
    );
}
