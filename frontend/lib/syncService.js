'use client';

import { processSyncQueue } from './apiClient';

let syncInterval = null;

/**
 * Initialize sync service
 * - Listens for online/offline events
 * - Automatically syncs queue when connection restored
 * - Periodic sync checks while online
 */
export const initSyncService = () => {
    if (typeof window === 'undefined') {
        return; // Skip on server-side
    }

    console.log('🔄 Initializing sync service...');

    // Listen for online event
    window.addEventListener('online', handleOnline);

    // Listen for offline event
    window.addEventListener('offline', handleOffline);

    // Check if already online and start periodic sync
    if (navigator.onLine) {
        startPeriodicSync();
    }
};

/**
 * Clean up sync service listeners
 */
export const cleanupSyncService = () => {
    if (typeof window === 'undefined') {
        return;
    }

    console.log('🔄 Cleaning up sync service...');

    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    stopPeriodicSync();
};

/**
 * Handle coming back online
 */
const handleOnline = async () => {
    console.log('✓ Connection restored, syncing queued items...');

    try {
        const result = await processSyncQueue();
        console.log(
            `✓ Sync complete: ${result.processed} synced, ${result.failed} failed`
        );

        // Show notification to user
        if (result.processed > 0) {
            showNotification(`Synced ${result.processed} pending changes`);
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }

    // Start periodic sync
    startPeriodicSync();
};

/**
 * Handle going offline
 */
const handleOffline = () => {
    console.log('✗ Connection lost, entering offline mode...');
    showNotification('Offline mode: Changes will sync when back online');

    // Stop periodic sync
    stopPeriodicSync();
};

/**
 * Start periodic sync checks (every 5 minutes while online)
 */
const startPeriodicSync = () => {
    if (syncInterval) {
        return; // Already running
    }

    console.log('🔄 Starting periodic sync (every 5 minutes)');

    syncInterval = setInterval(
        async () => {
            if (navigator.onLine) {
                try {
                    const result = await processSyncQueue();
                    if (result.processed > 0) {
                        console.log(
                            `🔄 Background sync: ${result.processed} items`
                        );
                    }
                } catch (error) {
                    console.error('Background sync failed:', error);
                }
            }
        },
        5 * 60 * 1000
    ); // 5 minutes
};

/**
 * Stop periodic sync
 */
const stopPeriodicSync = () => {
    if (syncInterval) {
        console.log('🔄 Stopping periodic sync');
        clearInterval(syncInterval);
        syncInterval = null;
    }
};

/**
 * Manually trigger sync
 */
export const triggerSync = async () => {
    console.log('🔄 Manual sync triggered...');

    if (!navigator.onLine) {
        showNotification('Cannot sync while offline');
        return { success: false, message: 'Device is offline' };
    }

    try {
        const result = await processSyncQueue();
        const message =
            result.processed > 0
                ? `Synced ${result.processed} items`
                : 'Nothing to sync';
        showNotification(message);

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        console.error('Manual sync failed:', error);
        showNotification('Sync failed');
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Show user notification (can be replaced with toast library)
 */
const showNotification = (message) => {
    console.log(`📢 ${message}`);

    // TODO: Replace with proper toast notification library
    // For now, use console and optionally browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Bible Study App', { body: message });
        }
    }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};
