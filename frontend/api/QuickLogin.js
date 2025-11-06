'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';

export default function QuickLogin() {
    const [email, setEmail] = useState('jovanni.feliz@example.com');
    const [password, setPassword] = useState('112233');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { setAuth, clearAuth } = useAuthStore();

    const handleLogin = async () => {
        setLoading(true);
        setMessage('');
        /* 
STEP 1: When you click the "Login & Save Token" button in DOM:
- Line 24-31 Sends email + password to backend
- NEXT Go to Backend Handler: backend/api/views.py:114-148 (login_view)
 */
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

            // Update Zustand store (this is what axios interceptor reads!)
            setAuth(data.user, data.access_token);

            setMessage('✅ Logged in! Token saved to Zustand store.');
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
        clearAuth();
        setMessage('🗑️ Token cleared from Zustand store');
    };

    const checkToken = () => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            setMessage(
                '✅ Token exists: ' + accessToken.substring(0, 30) + '...'
            );
        } else {
            setMessage('❌ No token found in Zustand store');
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
