'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/auth-store';
import { apiURL } from '@/lib/config';

export default function SettingsPage() {
    const { user, accessToken, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [deletionDate, setDeletionDate] = useState(null);
    const [daysRemaining, setDaysRemaining] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userWithDeletion, setUserWithDeletion] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (accessToken) {
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, isAuthenticated]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${apiURL}/auth/profile/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUserWithDeletion(response.data);

            if (response.data.deletion_requested_at) {
                calculateDaysRemaining(response.data.deletion_requested_at);
            }
        } catch (err) {
            setError('Failed to load user data');
        }
    };

    const calculateDaysRemaining = (deletionRequestedAt) => {
        const requestDate = new Date(deletionRequestedAt);
        const deleteDate = new Date(
            requestDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const now = new Date();
        const days = Math.ceil((deleteDate - now) / (1000 * 60 * 60 * 24));

        setDeletionDate(deleteDate.toLocaleDateString());
        setDaysRemaining(days > 0 ? days : 0);
    };

    const handleRequestDeletion = async () => {
        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${apiURL}/auth/request-deletion/`,
                { password },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            alert(response.data.message);
            setPassword('');
            await fetchUserData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request deletion');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDeletion = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${apiURL}/auth/cancel-deletion/`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            alert(response.data.message);
            await fetchUserData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel deletion');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await axios.get(`${apiURL}/auth/export-data/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const blob = new Blob([JSON.stringify(response.data, null, 2)], {
                type: 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user_data.json';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export data');
        }
    };

    if (!user || !userWithDeletion) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Account Settings</h1>

                <div className="mb-4">
                    <p className="text-gray-600">Email: {user.email}</p>
                </div>

                {/* Deletion Warning Alert */}
                {userWithDeletion.deletion_requested_at && (
                    <Alert variant="destructive">
                        <AlertTitle>⚠️ Account Deletion Scheduled</AlertTitle>
                        <AlertDescription>
                            <p className="mb-2">
                                Your account will be permanently deleted in{' '}
                                <strong>{daysRemaining} days</strong> (
                                {deletionDate})
                            </p>
                            <Button
                                onClick={handleCancelDeletion}
                                variant="outline"
                                className="mt-2"
                                disabled={loading}
                            >
                                {loading ? 'Canceling...' : 'Cancel Deletion'}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Export Data */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-2">
                        Export Your Data
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Download all your account data in JSON format
                    </p>
                    <Button onClick={handleExportData}>
                        Export Data (JSON)
                    </Button>
                </Card>

                {/* Delete Account */}
                {!userWithDeletion.deletion_requested_at && (
                    <Card className="p-6 border-red-200">
                        <h2 className="text-xl font-semibold mb-2 text-red-600">
                            Delete Account
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Permanently delete your account and all associated
                            data. You&apos;ll have 7 days to cancel.
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will schedule your account for
                                        deletion in 7 days. All your habits,
                                        notes, and progress will be permanently
                                        deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="my-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Confirm your password:
                                    </label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter password"
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        onClick={() => {
                                            setPassword('');
                                            setError('');
                                        }}
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleRequestDeletion}
                                        disabled={loading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {loading
                                            ? 'Processing...'
                                            : 'Delete Account'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </Card>
                )}
            </div>
        </div>
    );
}
