# API Client & Offline-First Architecture

Complete offline-first data layer with automatic sync, caching strategies, and queue management.

## 📁 File Structure

```
frontend/lib/
├── db.js                  # IndexedDB database layer
├── DBProvider.jsx         # React Context for database access
├── apiClient.js           # API client with caching strategies
├── syncService.js         # Automatic sync service
└── API_CLIENT_README.md   # This file
```

## 🎯 Caching Strategies

### 1. Cache-First (Bible Content)

**Use for:** Static biblical content, verses, books

**Flow:**

1. Check IndexedDB first
2. If found → return cached data
3. If not found AND online → fetch from API and cache
4. If offline → throw "not cached" error

**Functions:**

- `getBibleContent(endpoint, cacheKey)`
- `getVerse(reference)`
- `getVersesByBook(book)`

**Example:**

```javascript
import { getVerse } from '@/lib/apiClient';

const { data, source } = await getVerse('John 3:16');
// source: 'cache' or 'network'
```

### 2. Network-First (User Data)

**Use for:** User notes, settings, progress tracking

**Flow:**

1. If online → attempt API request
2. On success → update IndexedDB cache
3. On failure/timeout/offline → return cached data
4. If no cache → throw error

**Functions:**

- `getUserData(endpoint, cacheStore, cacheKey)`
- `getStudyNotes(verseId)`
- `getUserSettings()`

**Example:**

```javascript
import { getStudyNotes } from '@/lib/apiClient';

const { data, source, isStale } = await getStudyNotes('verse-123');
// source: 'network' or 'cache'
// isStale: true if from cache (may be outdated)
```

### 3. Network-First with Queue (Mutations)

**Use for:** Creating/updating notes, settings, user actions

**Flow:**

1. If online → POST to API
2. On success → update local cache
3. If offline → add to sync queue
4. Return optimistic response with `_pending` flag

**Functions:**

- `mutateData(endpoint, method, data, options)`
- `saveStudyNote(verseId, content, noteId)`
- `deleteStudyNote(noteId)`
- `updateSettings(settings)`

**Example:**

```javascript
import { saveStudyNote } from '@/lib/apiClient';

const { data, source, success, pending } = await saveStudyNote(
    'verse-123',
    'This is my favorite verse!'
);

// If offline:
// - source: 'offline-queue'
// - success: false
// - pending: true
// - data._pending: true
```

## 🔄 Automatic Sync Service

The sync service automatically handles offline→online transitions.

### Features:

- ✅ **Automatic sync** when connection restored
- ✅ **Periodic sync** every 5 minutes while online
- ✅ **Browser notifications** for sync status
- ✅ **Manual sync trigger** available

### Initialization:

Already integrated in `DBProvider.jsx` - no setup needed!

### Manual Sync:

```javascript
import { triggerSync } from '@/lib/syncService';

const result = await triggerSync();
// { success: true, processed: 3, failed: 0 }
```

### Request Notifications:

```javascript
import { requestNotificationPermission } from '@/lib/syncService';

await requestNotificationPermission();
```

## ⏱️ Request Timeout

All API requests have a **5-second timeout** to prevent hanging:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
await fetch(url, { signal: controller.signal });
```

## 🔒 JWT Authentication (TODO)

Placeholders are in place for JWT integration:

```javascript
// In apiClient.js

// TODO: Add JWT token to headers
headers: {
  'Content-Type': 'application/json',
  // Authorization: `Bearer ${getAccessToken()}`,
}

// TODO: Handle 401 with JWT refresh
if (response.status === 401) {
  await refreshToken();
  return fetchWithTimeout(url, options); // Retry
}
```

## 📊 Response Format

All API client functions return a consistent format:

```typescript
{
  data: any,           // The actual data
  source: string,      // 'network' | 'cache' | 'offline-queue' | 'error-queue'
  success?: boolean,   // true if API call succeeded
  pending?: boolean,   // true if queued for later sync
  isStale?: boolean,   // true if from cache (may be outdated)
  error?: string       // Error message if failed
}
```

## 🎮 Usage Examples

### Example 1: Fetch and Cache a Verse

```javascript
'use client';

import { getVerse } from '@/lib/apiClient';
import { useState, useEffect } from 'react';

export default function VersePage() {
    const [verse, setVerse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadVerse = async () => {
            try {
                const { data, source } = await getVerse('John 3:16');
                setVerse(data);
                console.log(`Loaded from: ${source}`);
            } catch (error) {
                console.error('Failed to load verse:', error);
            } finally {
                setLoading(false);
            }
        };

        loadVerse();
    }, []);

    if (loading) return <div>Loading...</div>;
    return <div>{verse?.text}</div>;
}
```

### Example 2: Save Study Note (with offline support)

```javascript
'use client';

import { saveStudyNote } from '@/lib/apiClient';
import { useState } from 'react';

export default function NotesForm({ verseId }) {
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await saveStudyNote(verseId, content);

            if (result.pending) {
                alert('Saved locally! Will sync when back online.');
            } else if (result.success) {
                alert('Saved successfully!');
            } else {
                alert('Save failed, but queued for retry.');
            }
        } catch (error) {
            alert('Error saving note');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your study note..."
            />
            <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Note'}
            </button>
        </form>
    );
}
```

### Example 3: Display Sync Status

```javascript
'use client';

import { triggerSync } from '@/lib/syncService';
import { useDB } from '@/lib/DBProvider';
import { useState, useEffect } from 'react';

export default function SyncStatus() {
    const { db } = useDB();
    const [queueCount, setQueueCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const checkQueue = async () => {
            const queue = await db.getSyncQueue();
            setQueueCount(queue.length);
        };

        checkQueue();
        const interval = setInterval(checkQueue, 5000);
        return () => clearInterval(interval);
    }, [db]);

    const handleSync = async () => {
        setSyncing(true);
        await triggerSync();

        const queue = await db.getSyncQueue();
        setQueueCount(queue.length);
        setSyncing(false);
    };

    if (queueCount === 0) return null;

    return (
        <div className="sync-banner">
            {queueCount} pending changes
            <button onClick={handleSync} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
        </div>
    );
}
```

## 🧪 Testing Offline Functionality

### Chrome DevTools:

1. Open DevTools → Network tab
2. Change "No throttling" to "Offline"
3. Try adding a study note
4. Check Application → IndexedDB → BibleStudyDB → syncQueue
5. Change back to "Online"
6. Watch automatic sync happen

### Console Commands:

```javascript
// Check sync queue
const queue = await db.getSyncQueue();
console.log('Pending items:', queue);

// Manually trigger sync
await triggerSync();

// Clear all queued items
await db.clearAllSyncQueue();
```

## 🔍 Debugging

Enable verbose logging by checking console for these indicators:

- 📦 `Cache hit:` - Data loaded from IndexedDB
- 🌐 `Fetching from API:` - Network request made
- 🔄 `Processing X queued items` - Sync running
- ✓ `Synced:` - Item successfully synced
- ✗ `Failed to sync:` - Sync error (item remains in queue)

## ⚡ Performance Tips

1. **Prefetch common content** - Cache popular verses on app load
2. **Batch requests** - Use bulk endpoints when available
3. **Clear old cache** - Implement cache expiration logic
4. **Optimize sync** - Process queue in batches, not one-by-one

## 🚀 Next Steps

### TODO List:

- [ ] Add JWT authentication (Step 5)
- [ ] Implement cache expiration/cleanup
- [ ] Add retry logic with exponential backoff
- [ ] Replace console notifications with toast library
- [ ] Add request deduplication
- [ ] Implement optimistic UI updates
- [ ] Add conflict resolution for sync
- [ ] Create background sync with Service Worker API
- [ ] Add telemetry/analytics for offline usage
- [ ] Implement data encryption for sensitive content

## 📚 Related Files

- [db.js](./db.js) - IndexedDB setup and CRUD operations
- [DBProvider.jsx](./DBProvider.jsx) - React Context wrapper
- [syncService.js](./syncService.js) - Automatic sync handling
- [MOBILE_UTILS_README.md](../MOBILE_UTILS_README.md) - Mobile device detection

## 🤝 Contributing

When adding new API endpoints:

1. Determine appropriate caching strategy (Cache-First, Network-First, or Queue)
2. Add function to `apiClient.js`
3. Add corresponding IndexedDB operations to `db.js` if needed
4. Update this README with examples
5. Test offline functionality

---

**Built with ❤️ for offline-first Bible study**
