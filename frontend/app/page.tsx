'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { useDB } from '../lib/DBProvider';
import { saveStudyNote } from '../lib/apiClient';

import SyncStatusBanner from './components/SyncStatusBanner';

export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState<
        'loading' | 'connected' | 'disconnected'
    >('loading');
    const [verses, setVerses] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [noteText, setNoteText] = useState('');
    const { isInitialized, db, syncStatus } = useDB();

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8000/api/health/'
                );
                if (response.data.database_connected) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (error) {
                console.error('Error checking connection:', error);
                setConnectionStatus('disconnected');
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load verses from IndexedDB
    useEffect(() => {
        if (isInitialized) {
            loadVerses();
        }
    }, [isInitialized]);

    const loadVerses = async () => {
        try {
            const allVerses = await db.getAllVerses();
            setVerses(allVerses);
        } catch (error) {
            console.error('Error loading verses:', error);
        }
    };

    const addSampleVerse = async () => {
        try {
            await db.addVerse({
                id: `verse-${Date.now()}`,
                reference: 'John 3:16',
                book: 'John',
                chapter: 3,
                verse: 16,
                text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
            });
            await loadVerses();
        } catch (error) {
            console.error('Error adding verse:', error);
        }
    };

    const clearAllVerses = async () => {
        try {
            for (const verse of verses) {
                await db.deleteVerse(verse.id);
            }
            await loadVerses();
        } catch (error) {
            console.error('Error clearing verses:', error);
        }
    };

    // Load notes from IndexedDB
    useEffect(() => {
        if (isInitialized) {
            loadNotes();
        }
    }, [isInitialized]);

    const loadNotes = async () => {
        try {
            const allNotes = await db.getAllStudyNotes();
            setNotes(allNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;

        try {
            const result = await saveStudyNote('sample-verse', noteText);

            if (result.pending) {
                alert('📝 Note saved offline! Will sync when back online.');
            } else if (result.success) {
                alert('✓ Note saved successfully!');
            } else {
                alert('⚠️ Note saved locally, queued for sync.');
            }

            setNoteText('');
            await loadNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note');
        }
    };

    return (
        <>
            <SyncStatusBanner />
            <div className="container">
                <h1>Bible Study App</h1>

                <div className={`status ${connectionStatus}`}>
                    <strong>Backend:</strong>{' '}
                    {connectionStatus === 'loading' && 'Checking connection...'}
                    {connectionStatus === 'connected' && '✓ Connected'}
                    {connectionStatus === 'disconnected' && '✗ Disconnected'}
                </div>

                <div
                    className={`status ${isInitialized ? 'connected' : 'loading'}`}
                >
                    <strong>IndexedDB:</strong>{' '}
                    {isInitialized ? '✓ Ready' : 'Initializing...'}
                </div>

                {syncStatus && (
                    <div className="status">
                        <strong>Sync Queue:</strong>{' '}
                        {syncStatus.pendingCount > 0
                            ? `${syncStatus.pendingCount} pending`
                            : '✓ Up to date'}
                    </div>
                )}

                {isInitialized && (
                    <>
                        <div style={{ marginTop: '20px' }}>
                            <h2>Cached Verses ({verses.length})</h2>
                            <div style={{ marginBottom: '10px' }}>
                                <button
                                    onClick={addSampleVerse}
                                    style={{ marginRight: '10px' }}
                                >
                                    Add Sample Verse
                                </button>
                                {verses.length > 0 && (
                                    <button onClick={clearAllVerses}>
                                        Clear All Verses
                                    </button>
                                )}
                            </div>

                            {verses.length > 0 ? (
                                <ul>
                                    {verses.map((verse) => (
                                        <li key={verse.id}>
                                            <strong>{verse.reference}:</strong>{' '}
                                            {verse.text}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>
                                    No verses cached yet. Add a sample verse to
                                    test!
                                </p>
                            )}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <h2>Study Notes ({notes.length})</h2>
                            <div style={{ marginBottom: '10px' }}>
                                <textarea
                                    value={noteText}
                                    onChange={(e) =>
                                        setNoteText(e.target.value)
                                    }
                                    placeholder="Write a study note (works offline!)..."
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '8px',
                                        marginBottom: '8px',
                                    }}
                                />
                                <button onClick={handleAddNote}>
                                    Save Note (Test Offline Mode)
                                </button>
                            </div>

                            {notes.length > 0 ? (
                                <ul>
                                    {notes.map((note) => (
                                        <li
                                            key={note.id}
                                            style={{
                                                marginBottom: '8px',
                                                padding: '8px',
                                                backgroundColor: note._pending
                                                    ? '#fef3c7'
                                                    : '#f3f4f6',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            {note.content}
                                            {note._pending && (
                                                <span
                                                    style={{
                                                        marginLeft: '8px',
                                                        fontSize: '12px',
                                                        color: '#f59e0b',
                                                    }}
                                                >
                                                    (Pending Sync)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>
                                    No notes yet. Try going offline (DevTools →
                                    Network → Offline) and add a note!
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
