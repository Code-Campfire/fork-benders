'use client';

import { useEffect } from 'react';

export default function GoogleLoginButton() {
    useEffect(() => {
        // Create the Google Identity script
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
        const token = response.credential;

        try {
            const res = await fetch('http://localhost:8000/auth/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                alert(`Welcome ${data.email}!`);
            } else {
                alert('Login failed');
                console.error('Backend error:', data);
            }
        } catch (err) {
            console.error('Error during login:', err);
        }
    };

    return <div id="google-signin-btn" className="flex justify-center mt-6" />;
}
