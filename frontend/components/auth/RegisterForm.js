'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import {
    validatePassword,
    getPasswordStrength,
} from '../../utils/passwordValidation';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirm: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [emailSent, setEmailSent] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState({
        errors: [],
        strength: null,
    });

    const router = useRouter();
    const { setLoading } = useAuthStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }

        if (name === 'password') {
            const validation = validatePassword(value);
            const strength = value ? getPasswordStrength(value) : null;
            setPasswordFeedback({ errors: validation.errors, strength });
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
            setEmailSent(true);
            setEmailError(null);
        } catch (error) {
            if (error.response?.data?.error) {
                setEmailError(error.response.data.error);
            } else {
                setEmailError(
                    'Failed to send verification email. Please try again.'
                );
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoading(true);
        setErrors({});

        // Check if passwords match
        if (formData.password !== formData.password_confirm) {
            setErrors({ password_confirm: 'Passwords do not match' });
            setIsLoading(false);
            setLoading(false);
            return;
        }

        // Validate password strength
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setErrors({ password: passwordValidation.errors.join(', ') });
            setIsLoading(false);
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register(formData);

            // Show success message - user needs to verify email before logging in
            setSuccess(true);
            setSuccessMessage(
                response.data.message ||
                    'Account created successfully! Please check your email to verify your account.'
            );
            setEmailSent(response.data.email_sent);
            setEmailError(response.data.email_error || null);

            // Don't auto-login anymore - user must verify email first
        } catch (error) {
            if (error.response?.data) {
                const errorData = error.response.data;
                const formattedErrors = {};

                // Handle Django password validation errors which come as arrays
                Object.keys(errorData).forEach((key) => {
                    if (Array.isArray(errorData[key])) {
                        formattedErrors[key] = errorData[key].join(' ');
                    } else {
                        formattedErrors[key] = errorData[key];
                    }
                });

                setErrors(formattedErrors);
            } else {
                setErrors({
                    general: 'Registration failed. Please try again.',
                });
            }
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">
                Create Account
            </h2>

            {success && emailSent && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <div className="flex items-start">
                        <svg
                            className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
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
                        <div className="flex-1">
                            <p className="font-medium">{successMessage}</p>
                            <p className="mt-2 text-sm">
                                Check your inbox and spam folder for the
                                verification email.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {success && emailSent === false && !resendSuccess && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                    <div className="flex items-start">
                        <svg
                            className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="font-medium mb-2">Account Created</p>
                            <p className="text-sm mb-3">
                                Your account was created successfully, but the
                                verification email failed to send.
                            </p>
                            {emailError && (
                                <p className="text-sm mb-3 text-yellow-700">
                                    Error: {emailError}
                                </p>
                            )}
                            <p className="text-sm mb-3">
                                You can try sending the verification email
                                again.
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendLoading}
                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 mb-2"
                            >
                                {resendLoading
                                    ? 'Sending...'
                                    : 'Resend Verification Email'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="w-full text-sm text-yellow-800 hover:text-yellow-900 underline"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {success && resendSuccess && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    <div className="flex items-start">
                        <svg
                            className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="font-medium">
                                Verification Email Sent!
                            </p>
                            <p className="mt-2 text-sm">
                                Please check your inbox and spam folder for the
                                verification link.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {errors.general && (
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

                {formData.password && (
                    <div className="mt-2">
                        {passwordFeedback.strength && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Strength:</span>
                                <span
                                    className={`text-sm font-medium text-${passwordFeedback.strength.color}-600`}
                                >
                                    {passwordFeedback.strength.strength}
                                </span>
                            </div>
                        )}
                        {passwordFeedback.errors.length > 0 && (
                            <ul className="mt-1 text-sm text-red-600">
                                {passwordFeedback.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                    </p>
                )}
            </div>

            <div className="mb-6">
                <label
                    htmlFor="password_confirm"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Confirm Password
                </label>
                <input
                    type="password"
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password_confirm}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                    Sign in
                </a>
            </p>
        </form>
    );
}
