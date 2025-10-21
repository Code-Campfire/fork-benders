'use client';

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
                if (typeof error.response.data === 'object') {
                    setErrors(error.response.data);
                } else {
                    setErrors({
                        general: error.response.data.detail || 'Login failed',
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

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

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
