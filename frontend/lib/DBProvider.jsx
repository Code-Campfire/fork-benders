'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import * as db from './db';
import {
    cleanupSyncManager,
    getSyncStatus,
    initSyncManager,
    triggerManualSync,
} from './syncManager';

const DBContext = createContext({
    isInitialized: false,
    error: null,
    db: db,
    syncStatus: {
        pendingCount: 0,
        items: [],
        isOnline: false,
        isSyncing: false,
    },
    triggerSync: async () => ({ success: false, message: 'Not initialized' }),
});

export function DBProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const [syncStatus, setSyncStatus] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                // Initialize database
                await db.initDB();
                setIsInitialized(true);

                // Initialize sync manager after DB is ready
                initSyncManager();

                // Get initial sync status
                const status = await getSyncStatus();
                setSyncStatus(status);
            } catch (err) {
                console.error('Failed to initialize:', err);
                setError(err);
            }
        };

        initialize();

        // Update sync status periodically (reduced frequency)
        const statusInterval = setInterval(async () => {
            if (isInitialized) {
                const status = await getSyncStatus();
                setSyncStatus(status);
            }
        }, 30000); // Check every 30 seconds

        // Cleanup on unmount
        return () => {
            cleanupSyncManager();
            clearInterval(statusInterval);
        };
    }, [isInitialized]);

    const value = {
        isInitialized,
        error,
        db,
        syncStatus,
        triggerSync: triggerManualSync,
    };

    return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
    const context = useContext(DBContext);
    if (!context) {
        throw new Error('useDB must be used within a DBProvider');
    }
    return context;
}
