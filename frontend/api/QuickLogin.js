'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QuickLogin() {
    const [email, setEmail] = useState('jovanni.feliz@example.com');
    const [password, setPassword] = useState('112233');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(
                'http://localhost:8000/api/auth/login/',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Save token to localStorage (this is what axios reads!)
            localStorage.setItem('access_token', data.access_token);

            setMessage('✅ Logged in! Token saved to localStorage.');
            console.log(
                '✅ Token saved:',
                data.access_token.substring(0, 20) + '...'
            );
        } catch (error) {
            setMessage('❌ Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setMessage('🗑️ Token cleared');
    };

    const checkToken = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setMessage('✅ Token exists: ' + token.substring(0, 30) + '...');
        } else {
            setMessage('❌ No token found in localStorage');
        }
    };

    return (
        <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-300 max-w-md">
            <h3 className="text-xl font-bold mb-4">Quick Login</h3>

            <div className="space-y-2 mb-4">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-green-600"
                >
                    {loading ? 'Logging in...' : 'Login & Save Token'}
                </Button>
                <Button
                    onClick={checkToken}
                    variant="outline"
                    className="w-full"
                >
                    Check Token
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                >
                    Logout (Clear Token)
                </Button>
            </div>

            {message && (
                <div className="mt-4 p-3 bg-white rounded border text-sm">
                    {message}
                </div>
            )}
        </div>
    );
}
