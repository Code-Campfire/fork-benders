'use client';

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
    const [passwordFeedback, setPasswordFeedback] = useState({
        errors: [],
        strength: null,
    });

    const router = useRouter();
    const { setAuth, setLoading } = useAuthStore();

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
            await authAPI.register(formData);
            const loginResponse = await authAPI.login({
                email: formData.email,
                password: formData.password,
            });

            const { access_token, user } = loginResponse.data;
            setAuth(user, access_token);
            router.push('/dashboard');
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
