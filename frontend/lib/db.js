import { openDB } from 'idb';

const DB_NAME = 'BibleStudyDB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Verses store - Cache-First
            if (!db.objectStoreNames.contains('verses')) {
                const verseStore = db.createObjectStore('verses', {
                    keyPath: 'id',
                });
                verseStore.createIndex('reference', 'reference', {
                    unique: false,
                });
                verseStore.createIndex('book', 'book', { unique: false });
            }

            // Study notes store - Network-First with offline queue
            if (!db.objectStoreNames.contains('studyNotes')) {
                const notesStore = db.createObjectStore('studyNotes', {
                    keyPath: 'id',
                });
                notesStore.createIndex('verseId', 'verseId', { unique: false });
                notesStore.createIndex('timestamp', 'timestamp', {
                    unique: false,
                });
            }

            // User settings - Network-First
            if (!db.objectStoreNames.contains('userSettings')) {
                db.createObjectStore('userSettings', { keyPath: 'key' });
            }

            // Sync queue for offline actions
            if (!db.objectStoreNames.contains('syncQueue')) {
                const syncStore = db.createObjectStore('syncQueue', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                syncStore.createIndex('timestamp', 'timestamp', {
                    unique: false,
                });
                syncStore.createIndex('type', 'type', { unique: false });
            }
        },
    });
};

// ===== VERSE CRUD OPERATIONS =====

export const addVerse = async (verse) => {
    const db = await initDB();
    return db.put('verses', verse);
};

export const getVerse = async (id) => {
    const db = await initDB();
    return db.get('verses', id);
};

export const getVerseByReference = async (reference) => {
    const db = await initDB();
    return db.getFromIndex('verses', 'reference', reference);
};

export const getVersesByBook = async (book) => {
    const db = await initDB();
    return db.getAllFromIndex('verses', 'book', book);
};

export const getAllVerses = async () => {
    const db = await initDB();
    return db.getAll('verses');
};

export const deleteVerse = async (id) => {
    const db = await initDB();
    return db.delete('verses', id);
};

// ===== STUDY NOTES CRUD OPERATIONS =====

export const addStudyNote = async (note) => {
    const db = await initDB();
    const noteWithTimestamp = {
        ...note,
        timestamp: note.timestamp || Date.now(),
    };
    return db.put('studyNotes', noteWithTimestamp);
};

export const getStudyNote = async (id) => {
    const db = await initDB();
    return db.get('studyNotes', id);
};

export const getStudyNotesByVerse = async (verseId) => {
    const db = await initDB();
    return db.getAllFromIndex('studyNotes', 'verseId', verseId);
};

export const getAllStudyNotes = async () => {
    const db = await initDB();
    return db.getAll('studyNotes');
};

export const updateStudyNote = async (id, updates) => {
    const db = await initDB();
    const note = await db.get('studyNotes', id);
    if (!note) return null;

    const updatedNote = {
        ...note,
        ...updates,
        timestamp: Date.now(),
    };
    return db.put('studyNotes', updatedNote);
};

export const deleteStudyNote = async (id) => {
    const db = await initDB();
    return db.delete('studyNotes', id);
};

// ===== USER SETTINGS OPERATIONS =====

export const getSetting = async (key) => {
    const db = await initDB();
    return db.get('userSettings', key);
};

export const setSetting = async (key, value) => {
    const db = await initDB();
    return db.put('userSettings', { key, value });
};

export const getAllSettings = async () => {
    const db = await initDB();
    return db.getAll('userSettings');
};

export const deleteSetting = async (key) => {
    const db = await initDB();
    return db.delete('userSettings', key);
};

// ===== SYNC QUEUE OPERATIONS =====

export const addToSyncQueue = async (action) => {
    const db = await initDB();
    const queueItem = {
        ...action,
        timestamp: Date.now(),
    };
    return db.add('syncQueue', queueItem);
};

export const getSyncQueue = async () => {
    const db = await initDB();
    return db.getAll('syncQueue');
};

export const getSyncQueueByType = async (type) => {
    const db = await initDB();
    return db.getAllFromIndex('syncQueue', 'type', type);
};

export const clearSyncQueueItem = async (id) => {
    const db = await initDB();
    return db.delete('syncQueue', id);
};

export const clearAllSyncQueue = async () => {
    const db = await initDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.clear();
    return tx.done;
};
