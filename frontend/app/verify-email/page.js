'use client';

import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiURL } from '@/lib/config';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const uidb64 = searchParams.get('uidb64');

        if (!token || !uidb64) {
            setStatus('error');
            setMessage(
                'Invalid verification link. Please check your email for the correct link.'
            );
            return;
        }

        const verifyEmail = async (token, uidb64) => {
            try {
                const response = await axios.post(
                    `${apiURL}/auth/verify-email/`,
                    {
                        token,
                        uidb64,
                    }
                );

                setStatus('success');
                setMessage(
                    response.data.message || 'Email verified successfully!'
                );

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');

                if (error.response?.data) {
                    setMessage(
                        error.response.data.error || 'Verification failed.'
                    );
                    setCanResend(error.response.data.can_resend || false);
                } else {
                    setMessage('Verification failed. Please try again.');
                }
            }
        };

        verifyEmail(token, uidb64);
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center">
                        {status === 'verifying' && (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Verifying your email...
                                </h2>
                                <p className="text-gray-600">
                                    Please wait while we verify your email
                                    address.
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="mb-4">
                                    <svg
                                        className="mx-auto h-16 w-16 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Email Verified!
                                </h2>
                                <p className="text-gray-600 mb-4">{message}</p>
                                <p className="text-sm text-gray-500">
                                    Redirecting to login page...
                                </p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="mb-4">
                                    <svg
                                        className="mx-auto h-16 w-16 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Verification Failed
                                </h2>
                                <p className="text-gray-600 mb-6">{message}</p>

                                <div className="space-y-3">
                                    {canResend && (
                                        <button
                                            onClick={() =>
                                                router.push(
                                                    '/login?resend=true'
                                                )
                                            }
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Request New Verification Email
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Go to Login
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
