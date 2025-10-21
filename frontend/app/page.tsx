'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import GoogleLoginButton from '../components/GoogleLoginButton';

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
        <div className="container">
            <h1>Hello World</h1>
            <div className={`status ${connectionStatus}`}>
                {connectionStatus === 'loading' && 'Checking connection...'}
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
            </div>
            <GoogleLoginButton />
        </div>
    );
}
