import { apiURL } from './config';
import * as db from './db';

const REQUEST_TIMEOUT = 5000; // 5 seconds

// ===== HELPER FUNCTIONS =====

/**
 * Check if the browser is online
 */
const isOnline = () => {
    return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Fetch with timeout and abort controller
 */
const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                // TODO: Add JWT token check from Step 5 before each request
                // Authorization: `Bearer ${getAccessToken()}`,
            },
        });

        clearTimeout(timeoutId);

        // TODO: Handle 401 with JWT refresh from Step 5
        // if (response.status === 401) {
        //   await refreshToken();
        //   return fetchWithTimeout(url, options); // Retry with new token
        // }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout after 5 seconds');
        }
        throw error;
    }
};

// ===== CACHE-FIRST STRATEGY (Bible Content) =====

/**
 * Cache-First: Check IndexedDB first, fetch if not found and online
 * Use for: Bible verses, book content, static biblical data
 */
export const getBibleContent = async (endpoint, cacheKey) => {
    try {
        // 1. Check IndexedDB first
        const cached = await db.getVerse(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit: ${cacheKey}`);
            return { data: cached, source: 'cache' };
        }

        // 2. If not found AND online, fetch and cache
        if (isOnline()) {
            console.log(`🌐 Fetching from API: ${endpoint}`);
            const response = await fetchWithTimeout(`${apiURL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Cache the result
            await db.addVerse({ id: cacheKey, ...data });

            return { data, source: 'network' };
        }

        // 3. If offline, return "not cached" error
        throw new Error('Content not cached and device is offline');
    } catch (error) {
        console.error('getBibleContent error:', error);
        throw error;
    }
};

/**
 * Get verse by reference (Cache-First)
 */
export const getVerse = async (reference) => {
    const cacheKey = `verse-${reference.toLowerCase().replace(/\s+/g, '-')}`;
    return getBibleContent(`/verses/${reference}`, cacheKey);
};

/**
 * Get verses by book (Cache-First)
 */
export const getVersesByBook = async (book) => {
    try {
        // Check cache first
        const cached = await db.getVersesByBook(book);
        if (cached && cached.length > 0) {
            console.log(`📦 Cache hit: ${book} (${cached.length} verses)`);
            return { data: cached, source: 'cache' };
        }

        // Fetch if online
        if (isOnline()) {
            console.log(`🌐 Fetching from API: /verses/book/${book}`);
            const response = await fetchWithTimeout(
                `${apiURL}/verses/book/${book}`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Cache all verses
            for (const verse of data) {
                await db.addVerse(verse);
            }

            return { data, source: 'network' };
        }

        throw new Error('Content not cached and device is offline');
    } catch (error) {
        console.error('getVersesByBook error:', error);
        throw error;
    }
};

// ===== NETWORK-FIRST STRATEGY (User Data) =====

/**
 * Network-First: Try API first, fallback to cache if offline/failed
 * Use for: User notes, settings, progress tracking
 */
export const getUserData = async (endpoint, cacheStore, cacheKey) => {
    try {
        // 1. If online, attempt API request
        if (isOnline()) {
            console.log(`🌐 Fetching from API: ${endpoint}`);
            const response = await fetchWithTimeout(`${apiURL}${endpoint}`);

            // TODO: Handle 401 with JWT refresh from Step 5
            // if (response.status === 401) { ... }

            if (response.ok) {
                const data = await response.json();

                // 3. On success, update IndexedDB cache
                if (cacheStore === 'studyNotes') {
                    await db.addStudyNote({ id: cacheKey, ...data });
                } else if (cacheStore === 'userSettings') {
                    await db.setSetting(cacheKey, data);
                }

                return { data, source: 'network' };
            }

            throw new Error(`API error: ${response.status}`);
        }

        // 4. On failure/timeout/offline, return IndexedDB cache
        console.log('📦 Offline, checking cache...');
        let cached;

        if (cacheStore === 'studyNotes') {
            cached = await db.getStudyNote(cacheKey);
        } else if (cacheStore === 'userSettings') {
            cached = await db.getSetting(cacheKey);
        }

        if (cached) {
            return { data: cached, source: 'cache', isStale: true };
        }

        // 5. If no cache, return error state
        throw new Error('No cached data available and device is offline');
    } catch (error) {
        console.error('getUserData error:', error);

        // Try to return cached data on any error
        try {
            let cached;
            if (cacheStore === 'studyNotes') {
                cached = await db.getStudyNote(cacheKey);
            } else if (cacheStore === 'userSettings') {
                cached = await db.getSetting(cacheKey);
            }

            if (cached) {
                return { data: cached, source: 'cache', isStale: true };
            }
        } catch (cacheError) {
            console.error('Cache retrieval failed:', cacheError);
        }

        throw error;
    }
};

/**
 * Get study notes for a verse (Network-First)
 */
export const getStudyNotes = async (verseId) => {
    return getUserData(`/notes/${verseId}`, 'studyNotes', verseId);
};

/**
 * Get user settings (Network-First)
 */
export const getUserSettings = async () => {
    return getUserData('/settings', 'userSettings', 'user-settings');
};

// ===== NETWORK-FIRST WITH QUEUE (Mutations) =====

/**
 * Network-First with Queue: POST to API, queue if offline
 * Use for: Creating/updating notes, settings, user actions
 */
export const mutateData = async (endpoint, method, data, options = {}) => {
    const mutationId = `mutation-${Date.now()}`;

    try {
        // 1. If online, POST to API
        if (isOnline()) {
            console.log(`🌐 ${method} to API: ${endpoint}`);
            const response = await fetchWithTimeout(`${apiURL}${endpoint}`, {
                method,
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // TODO: Handle 401 with JWT refresh from Step 5
            // if (response.status === 401) { ... }

            if (response.ok) {
                const responseData = await response.json();

                // 3. On success, update local cache
                if (options.cacheStore === 'studyNotes') {
                    await db.addStudyNote({
                        id: options.cacheKey || responseData.id,
                        ...responseData,
                    });
                } else if (options.cacheStore === 'verses') {
                    await db.addVerse({
                        id: options.cacheKey || responseData.id,
                        ...responseData,
                    });
                }

                return { data: responseData, source: 'network', success: true };
            }

            throw new Error(`API error: ${response.status}`);
        }

        // 4. If offline, add to syncQueue in IndexedDB
        console.log('📦 Offline, adding to sync queue...');
        await db.addToSyncQueue({
            endpoint,
            method,
            data,
            mutationId,
            options,
        });

        // 5. Return optimistic response
        const optimisticData = {
            id: mutationId,
            ...data,
            _pending: true,
            _offline: true,
        };

        // Update local cache optimistically
        if (options.cacheStore === 'studyNotes') {
            await db.addStudyNote(optimisticData);
        } else if (options.cacheStore === 'verses') {
            await db.addVerse(optimisticData);
        }

        return {
            data: optimisticData,
            source: 'offline-queue',
            success: false,
            pending: true,
        };
    } catch (error) {
        console.error('mutateData error:', error);

        // On error, still queue the mutation
        await db.addToSyncQueue({
            endpoint,
            method,
            data,
            mutationId,
            options,
            error: error.message,
        });

        return {
            data: { id: mutationId, ...data, _pending: true, _error: true },
            source: 'error-queue',
            success: false,
            error: error.message,
        };
    }
};

/**
 * Create or update a study note (Network-First with Queue)
 */
export const saveStudyNote = async (verseId, noteContent, noteId = null) => {
    const method = noteId ? 'PUT' : 'POST';
    const endpoint = noteId ? `/notes/${noteId}` : '/notes';

    return mutateData(
        endpoint,
        method,
        { verseId, content: noteContent },
        {
            cacheStore: 'studyNotes',
            cacheKey: noteId || `note-${Date.now()}`,
        }
    );
};

/**
 * Delete a study note (Network-First with Queue)
 */
export const deleteStudyNote = async (noteId) => {
    return mutateData(
        `/notes/${noteId}`,
        'DELETE',
        { id: noteId },
        {
            cacheStore: 'studyNotes',
            cacheKey: noteId,
        }
    );
};

/**
 * Update user settings (Network-First with Queue)
 */
export const updateSettings = async (settings) => {
    return mutateData('/settings', 'PUT', settings, {
        cacheStore: 'userSettings',
        cacheKey: 'user-settings',
    });
};

// ===== SYNC QUEUE PROCESSOR =====

/**
 * Process pending sync queue items when back online
 */
export const processSyncQueue = async () => {
    if (!isOnline()) {
        console.log('Still offline, skipping sync');
        return { processed: 0, failed: 0 };
    }

    const queue = await db.getSyncQueue();
    console.log(`🔄 Processing ${queue.length} queued items...`);

    let processed = 0;
    let failed = 0;

    for (const item of queue) {
        try {
            const response = await fetchWithTimeout(
                `${apiURL}${item.endpoint}`,
                {
                    method: item.method,
                    body: JSON.stringify(item.data),
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Update cache with real server response
                if (item.options?.cacheStore === 'studyNotes') {
                    await db.addStudyNote({
                        id: item.options.cacheKey,
                        ...data,
                    });
                }

                // Remove from queue
                await db.clearSyncQueueItem(item.id);
                processed++;
                console.log(`✓ Synced: ${item.endpoint}`);
            } else {
                failed++;
                console.error(`✗ Failed to sync: ${item.endpoint}`);
            }
        } catch (error) {
            failed++;
            console.error(`✗ Error syncing ${item.endpoint}:`, error);
        }
    }

    console.log(`✓ Sync complete: ${processed} processed, ${failed} failed`);
    return { processed, failed };
};
