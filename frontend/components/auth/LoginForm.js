'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember_me: false,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [emailNotVerified, setEmailNotVerified] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const router = useRouter();
    const { setAuth, setLoading } = useAuthStore();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoading(true);
        setErrors({});

        try {
            const response = await authAPI.login(formData);
            const { access_token, user } = response.data;

            setAuth(user, access_token);
            router.push('/dashboard');
        } catch (error) {
            if (error.response?.data) {
                const errorData = error.response.data;

                // Check if it's an email verification error
                if (errorData.non_field_errors) {
                    const errorMessage = Array.isArray(
                        errorData.non_field_errors
                    )
                        ? errorData.non_field_errors[0]
                        : errorData.non_field_errors;

                    if (errorMessage.includes('Email address not verified')) {
                        setEmailNotVerified(true);
                        setErrors({ general: errorMessage });
                    } else {
                        setErrors({ general: errorMessage });
                    }
                } else if (typeof errorData === 'object') {
                    setErrors(errorData);
                } else {
                    setErrors({
                        general: errorData.detail || 'Login failed',
                    });
                }
            } else {
                setErrors({ general: 'Network error. Please try again.' });
            }
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendSuccess(false);

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            await axios.post(`${apiUrl}/auth/resend-verification/`, {
                email: formData.email,
            });

            setResendSuccess(true);
            setErrors({});
        } catch (error) {
            if (error.response?.data?.error) {
                setErrors({ general: error.response.data.error });
            } else {
                setErrors({
                    general:
                        'Failed to send verification email. Please try again.',
                });
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

            {resendSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p className="font-medium">Verification email sent!</p>
                    <p className="text-sm mt-1">
                        Please check your inbox and spam folder for the
                        verification link.
                    </p>
                </div>
            )}

            {errors.general && emailNotVerified && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                    <p className="font-medium mb-2">{errors.general}</p>
                    <p className="text-sm mb-3">
                        Please check your email for the verification link. If
                        you didn&apos;t receive it, you can request a new one.
                    </p>
                    <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                    >
                        {resendLoading
                            ? 'Sending...'
                            : 'Resend Verification Email'}
                    </button>
                </div>
            )}

            {errors.general && !emailNotVerified && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.general}
                </div>
            )}

            <div className="mb-4">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            <div className="mb-4">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="remember_me"
                        checked={formData.remember_me}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                        Remember me for 30 days
                    </span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a
                    href="/register"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Sign up
                </a>
            </p>
        </form>
    );
}
