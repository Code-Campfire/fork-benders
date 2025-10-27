'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '../lib/auth-store';

export default function GoogleLoginButton() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    useEffect(() => {
        // Create the Google Identity script,
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        // When script finishes loading, initialize Google Sign-In
        script.onload = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleCallbackResponse,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-btn'),
                    { theme: 'outline', size: 'large' }
                );
            } else {
                console.error('Google Identity Services failed to load.');
            }
        };

        document.body.appendChild(script);

        // Cleanup if component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCallbackResponse = async (response) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/google/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: response.credential }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setAuth({ email: data.email }, data.access_token);
                router.push('/dashboard');
            } else {
                console.error('Login failed:', data);
            }
        } catch (err) {
            console.error('Error during login:', err);
        }
    };

    return <div id="google-signin-btn" className="flex justify-center mt-6" />;
}
