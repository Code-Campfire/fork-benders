'use client';

import { useAuthStore } from './auth-store';
import { apiURL } from './config';
import * as db from './db';

const REQUEST_TIMEOUT = 5000;

let isInitialized = false;
let isSyncing = false;

/**
 * Initialize sync manager
 * - Sets up online/offline event listeners
 * - Triggers initial sync if online
 */
export const initSyncManager = () => {
    if (typeof window === 'undefined' || isInitialized) {
        return; // Skip on server-side or if already initialized
    }

    // Listen for online event
    window.addEventListener('online', handleOnlineEvent);

    // Listen for offline event for logging
    window.addEventListener('offline', handleOfflineEvent);

    // If already online, check for pending sync items (silent check)
    if (navigator.onLine) {
        syncData();
    }

    isInitialized = true;
};

/**
 * Cleanup sync manager (remove event listeners)
 */
export const cleanupSyncManager = () => {
    if (typeof window === 'undefined') {
        return;
    }

    window.removeEventListener('online', handleOnlineEvent);
    window.removeEventListener('offline', handleOfflineEvent);

    isInitialized = false;
};

/**
 * Handle online event
 */
const handleOnlineEvent = async () => {
    console.log('✓ Connection restored!');
    await syncData();
};

/**
 * Handle offline event
 */
const handleOfflineEvent = () => {
    console.log('✗ Connection lost - Entering offline mode');
    console.log(
        'Changes will be queued and synced when connection is restored'
    );
};

/**
 * Process syncQueue on connection restore
 * Implements last-write-wins strategy using timestamps
 */
export const syncData = async () => {
    // Prevent concurrent sync operations
    if (isSyncing) {
        return { success: false, message: 'Sync already running' };
    }

    // Check if online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return { success: false, message: 'Device is offline' };
    }

    isSyncing = true;

    try {
        // TODO: Check JWT validity from Step 5 before syncing
        // const isTokenValid = await checkTokenValidity();
        // if (!isTokenValid) {
        //   TODO: If token expired, attempt refresh from Step 5
        //   const refreshed = await refreshAccessToken();
        //   if (!refreshed) {
        //     return { success: false, message: 'Authentication failed' };
        //   }
        // }

        // 3. Get all items from syncQueue (ordered by timestamp)
        const queue = await db.getSyncQueue();

        if (queue.length === 0) {
            return { success: true, processed: 0, failed: 0 };
        }

        // Only log when we actually have items to sync
        console.log(`🔄 Processing ${queue.length} queued items...`);

        // Sort by timestamp (oldest first) for last-write-wins
        queue.sort((a, b) => a.timestamp - b.timestamp);

        let processed = 0;
        let failed = 0;
        const errors = [];

        // 4. For each item, attempt API request
        for (const item of queue) {
            try {
                const result = await syncQueueItem(item);

                if (result.success) {
                    // 6. On success: remove from queue, update local cache
                    await db.clearSyncQueueItem(item.id);
                    processed++;
                } else {
                    // 7. On failure: keep in queue for next sync
                    failed++;
                    errors.push({
                        item: item.endpoint,
                        error: result.error,
                    });
                    console.error(
                        `✗ Failed to sync: ${item.endpoint}`,
                        result.error
                    );
                }
            } catch (error) {
                // 7. On failure: keep in queue for next sync
                failed++;
                errors.push({ item: item.endpoint, error: error.message });
                console.error(`✗ Error syncing ${item.endpoint}:`, error);
            }
        }

        const message = `Sync complete: ${processed} synced, ${failed} failed`;
        console.log(`✓ ${message}`);

        // Show user notification
        showNotification(message);

        return {
            success: true,
            processed,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error('Sync failed:', error);
        return {
            success: false,
            message: error.message,
            error: error,
        };
    } finally {
        isSyncing = false;
    }
};

/**
 * Sync a single queue item
 * 8. Last-write-wins: always use queued data timestamp
 */
const syncQueueItem = async (item) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Build request with timestamp for last-write-wins
        const requestData = {
            ...item.data,
            _syncTimestamp: item.timestamp, // Server can use this for conflict resolution
        };

        // Get access token from auth store
        const accessToken = useAuthStore.getState().accessToken;

        const fetchOptions = {
            method: item.method,
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        };

        // Add Authorization header if token exists
        if (accessToken) {
            fetchOptions.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Only add body for non-GET/HEAD requests
        if (
            item.method &&
            !['GET', 'HEAD'].includes(item.method.toUpperCase())
        ) {
            fetchOptions.body = JSON.stringify(requestData);
        }

        const response = await fetch(`${apiURL}${item.endpoint}`, fetchOptions);

        clearTimeout(timeoutId);

        // TODO: Handle 401 responses with JWT refresh from Step 5
        // if (response.status === 401) {
        //   console.log('🔐 Received 401, attempting token refresh...');
        //   const refreshed = await refreshAccessToken();
        //   if (refreshed) {
        //     // Retry the request with new token
        //     return syncQueueItem(item);
        //   }
        //   return { success: false, error: 'Authentication failed' };
        // }

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const responseData = await response.json();

        // Update local cache with server response
        if (item.options?.cacheStore === 'studyNotes') {
            await db.addStudyNote({
                id: item.options.cacheKey || responseData.id,
                ...responseData,
                _synced: true,
                _syncedAt: Date.now(),
            });
        } else if (item.options?.cacheStore === 'verses') {
            await db.addVerse({
                id: item.options.cacheKey || responseData.id,
                ...responseData,
                _synced: true,
                _syncedAt: Date.now(),
            });
        } else if (item.options?.cacheStore === 'userSettings') {
            await db.setSetting(item.options.cacheKey, {
                ...responseData,
                _synced: true,
                _syncedAt: Date.now(),
            });
        }

        return { success: true, data: responseData };
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            return { success: false, error: 'Request timeout' };
        }

        return { success: false, error: error.message };
    }
};

/**
 * Manual sync trigger (exposed for user-initiated sync)
 */
export const triggerManualSync = async () => {
    console.log('🔄 Manual sync triggered by user');

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const message = 'Cannot sync while offline';
        showNotification(message);
        return { success: false, message };
    }

    const result = await syncData();

    if (result.success) {
        const message =
            result.processed > 0
                ? `Synced ${result.processed} item(s)`
                : 'Nothing to sync';
        showNotification(message);
    } else {
        showNotification('Sync failed');
    }

    return result;
};

/**
 * Get sync queue status
 */
export const getSyncStatus = async () => {
    try {
        const queue = await db.getSyncQueue();
        return {
            pendingCount: queue.length,
            items: queue,
            isOnline:
                typeof navigator !== 'undefined' ? navigator.onLine : false,
            isSyncing,
        };
    } catch (error) {
        console.error('Failed to get sync status:', error);
        return {
            pendingCount: 0,
            items: [],
            isOnline: false,
            isSyncing: false,
            error: error.message,
        };
    }
};

/**
 * Show user notification
 * TODO: Replace with proper toast/notification library
 */
const showNotification = (message) => {
    console.log(`📢 ${message}`);

    // Try browser notification if permission granted
    if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {
        try {
            new Notification('Bible Study App', {
                body: message,
                icon: '/icons/manifest-icon-192.maskable.png',
            });
        } catch (error) {
            console.warn('Failed to show notification:', error);
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
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }

    return false;
};

/**
 * Clear all pending sync items (use with caution)
 */
export const clearSyncQueue = async () => {
    try {
        await db.clearAllSyncQueue();
        console.log('✓ Sync queue cleared by user');
        return { success: true };
    } catch (error) {
        console.error('Failed to clear sync queue:', error);
        return { success: false, error: error.message };
    }
};
