'use client';

import {
    User,
    Settings,
    Upload,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileAPI } from '@/lib/profileAPI';

export default function ProfilePage() {
    // State management
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [displayName, setDisplayName] = useState('');
    const [reviewGoal, setReviewGoal] = useState(10);
    const [notifHour, setNotifHour] = useState(9);

    // Avatar state
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // UI state
    const [message, setMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load profile on mount
    useEffect(() => {
        loadProfile();

        // Online/offline detection
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadProfile = async () => {
        try {
            const response = await profileAPI.getUserProfile();
            setProfile(response.data);
            setDisplayName(response.data.display_name || '');
            setReviewGoal(response.data.review_goal_per_day || 10);
            setNotifHour(response.data.notif_hour || 9);
        } catch (error) {
            showMessage(
                'error',
                'Failed to load profile',
                error.response?.data?.error || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, title, description) => {
        setMessage({ type, title, description });
        setTimeout(() => setMessage(null), 5000);
    };

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!isOnline) {
            showMessage(
                'error',
                'Offline',
                'You must be online to update your profile'
            );
            return;
        }

        setSaving(true);
        try {
            const data = {
                display_name: displayName,
                review_goal_per_day: parseInt(reviewGoal),
                notif_hour: parseInt(notifHour),
            };

            await profileAPI.updateUserProfile(data);
            await loadProfile(); // Reload to get updated data
            showMessage(
                'success',
                'Profile Updated',
                'Your profile has been saved successfully'
            );
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            showMessage('error', 'Update Failed', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    // Handle avatar upload
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
            showMessage(
                'error',
                'Invalid File',
                'Please upload a JPEG, PNG, GIF, or WEBP image'
            );
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage(
                'error',
                'File Too Large',
                'Image must be less than 5MB'
            );
            return;
        }

        setAvatarFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        if (!isOnline) {
            showMessage(
                'error',
                'Offline',
                'You must be online to upload an avatar'
            );
            return;
        }

        setSaving(true);
        try {
            await profileAPI.uploadAvatar(avatarFile);
            await loadProfile(); // Reload to get new avatar URL
            setAvatarFile(null);
            setAvatarPreview(null);
            showMessage(
                'success',
                'Avatar Uploaded',
                'Your profile picture has been updated'
            );
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            showMessage('error', 'Upload Failed', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (email) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile, security settings, and preferences
                </p>
            </div>

            {/* Online/Offline Alert */}
            {!isOnline && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>You are offline</AlertTitle>
                    <AlertDescription>
                        You can view your profile, but editing requires an
                        internet connection.
                    </AlertDescription>
                </Alert>
            )}

            {/* Success/Error Messages */}
            {message && (
                <Alert
                    variant={
                        message.type === 'error' ? 'destructive' : 'default'
                    }
                    className="mb-6"
                >
                    {message.type === 'error' ? (
                        <AlertCircle className="h-4 w-4" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    <AlertTitle>{message.title}</AlertTitle>
                    <AlertDescription>{message.description}</AlertDescription>
                </Alert>
            )}

            {/* Main Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    {/* Avatar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>
                                Upload a profile picture. Max size: 5MB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage
                                        src={
                                            avatarPreview || profile?.avatar_url
                                        }
                                        alt="Profile picture"
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(profile?.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                        disabled={!isOnline || saving}
                                        className="max-w-sm"
                                    />
                                    {avatarFile && (
                                        <Button
                                            onClick={handleUploadAvatar}
                                            disabled={!isOnline || saving}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Picture
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update your personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleUpdateProfile}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="displayName">
                                        Display Name
                                    </Label>
                                    <Input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                        disabled={!isOnline || saving}
                                        placeholder="Enter your display name"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Account Created</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {profile?.created_at
                                            ? new Date(
                                                  profile.created_at
                                              ).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Last Login</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {profile?.last_login
                                            ? new Date(
                                                  profile.last_login
                                              ).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!isOnline || saving}
                                    className="w-full sm:w-auto"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Study Preferences</CardTitle>
                            <CardDescription>
                                Customize your Bible study experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleUpdateProfile}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="reviewGoal">
                                        Daily Review Goal
                                    </Label>
                                    <Input
                                        id="reviewGoal"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={reviewGoal}
                                        onChange={(e) =>
                                            setReviewGoal(e.target.value)
                                        }
                                        disabled={!isOnline || saving}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Number of verses to review per day
                                        (1-100)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notifHour">
                                        Notification Hour
                                    </Label>
                                    <Input
                                        id="notifHour"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={notifHour}
                                        onChange={(e) =>
                                            setNotifHour(e.target.value)
                                        }
                                        disabled={!isOnline || saving}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Hour to receive daily reminders (0-23,
                                        24-hour format)
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!isOnline || saving}
                                    className="w-full sm:w-auto"
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
