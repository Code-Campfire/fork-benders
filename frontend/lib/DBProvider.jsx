'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import * as db from './db';
import { cleanupSyncService, initSyncService } from './syncService';

const DBContext = createContext({
    isInitialized: false,
    error: null,
    db: db,
});

export function DBProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                await db.initDB();
                setIsInitialized(true);

                // Initialize sync service after DB is ready
                initSyncService();
            } catch (err) {
                console.error('Failed to initialize database:', err);
                setError(err);
            }
        };

        initialize();

        // Cleanup sync service on unmount
        return () => {
            cleanupSyncService();
        };
    }, []);

    const value = {
        isInitialized,
        error,
        db,
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
