'use client';

import { useEffect, useState } from 'react';

import { useDB } from '../lib/DBProvider';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const { syncStatus } = useDB();

    useEffect(() => {
        // Initialize with current online status
        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        // Listen for online event
        const handleOnline = () => {
            console.log('📡 Online event detected');
            setIsOnline(true);
        };

        // Listen for offline event
        const handleOffline = () => {
            console.log('📡 Offline event detected');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-hide when connection restored and no pending items
    const shouldShowBanner =
        !isOnline ||
        (syncStatus?.isSyncing && syncStatus?.pendingCount > 0) ||
        (isOnline && syncStatus?.pendingCount > 0);

    // Update CSS variable for content spacing
    useEffect(() => {
        if (shouldShowBanner) {
            document.documentElement.style.setProperty(
                '--banner-height',
                '46px'
            );
        } else {
            document.documentElement.style.setProperty(
                '--banner-height',
                '0px'
            );
        }
    }, [shouldShowBanner]);

    if (!shouldShowBanner) {
        return null;
    }

    // Determine banner message and styling
    const getBannerConfig = () => {
        if (!isOnline) {
            return {
                message: 'You are offline. Changes will sync when reconnected.',
                icon: '📡',
                backgroundColor: '#fee2e2',
                borderColor: '#f87171',
                textColor: '#991b1b',
            };
        }

        if (syncStatus?.isSyncing) {
            return {
                message: `Syncing ${syncStatus.pendingCount} item${syncStatus.pendingCount > 1 ? 's' : ''}...`,
                icon: '🔄',
                backgroundColor: '#dbeafe',
                borderColor: '#3b82f6',
                textColor: '#1e40af',
            };
        }

        if (syncStatus?.pendingCount > 0) {
            return {
                message: `${syncStatus.pendingCount} item${syncStatus.pendingCount > 1 ? 's' : ''} pending sync`,
                icon: '⚠️',
                backgroundColor: '#fef3c7',
                borderColor: '#fbbf24',
                textColor: '#92400e',
            };
        }

        return null;
    };

    const config = getBannerConfig();

    if (!config) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                padding: '12px 16px',
                backgroundColor: config.backgroundColor,
                borderBottom: `2px solid ${config.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <span
                style={{
                    fontSize: '18px',
                    animation: syncStatus?.isSyncing
                        ? 'spin 1s linear infinite'
                        : 'none',
                }}
            >
                {config.icon}
            </span>
            <span
                style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: config.textColor,
                }}
            >
                {config.message}
            </span>
            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
