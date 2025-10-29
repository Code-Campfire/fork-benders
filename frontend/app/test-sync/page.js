'use client';

import { useEffect, useState } from 'react';

import { useDB } from '../../lib/DBProvider';
import SyncStatusBanner from '../components/SyncStatusBanner';

export default function TestSyncPage() {
    const { db, isInitialized, syncStatus, triggerSync } = useDB();
    const [testResults, setTestResults] = useState([]);
    const [testNote, setTestNote] = useState('');

    useEffect(() => {
        if (isInitialized) {
            addTestResult('✅ Database initialized successfully');
        }
    }, [isInitialized]);

    const addTestResult = (message) => {
        setTestResults((prev) => [
            ...prev,
            { time: new Date().toLocaleTimeString(), message },
        ]);
    };

    const testAddNote = async () => {
        if (!testNote.trim()) {
            addTestResult('❌ Please enter a note');
            return;
        }

        try {
            const note = {
                id: `note-${Date.now()}`,
                verseId: 'test-verse-1',
                content: testNote,
                timestamp: Date.now(),
                _syncTimestamp: Date.now(),
            };

            if (db?.addStudyNote) {
                await db.addStudyNote(note);
                addTestResult(
                    `✅ Added note to IndexedDB: "${testNote.substring(0, 30)}..."`
                );
                setTestNote('');
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error adding note: ${error.message}`);
        }
    };

    const testAddToSyncQueue = async () => {
        try {
            const queueItem = {
                id: `queue-${Date.now()}`,
                type: 'studyNote',
                action: 'create',
                method: 'POST',
                endpoint: '/study-notes/',
                data: { content: 'Test sync item', verseId: 'test-verse-1' },
                timestamp: Date.now(),
            };

            if (db?.addToSyncQueue) {
                await db.addToSyncQueue(queueItem);
                addTestResult(
                    '✅ Added item to sync queue (will sync to /api/study-notes)'
                );
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error adding to queue: ${error.message}`);
        }
    };

    const testGetSyncQueue = async () => {
        try {
            if (db?.getSyncQueue) {
                const queue = await db.getSyncQueue();
                addTestResult(
                    `✅ Sync queue has ${queue.length} item(s): ${JSON.stringify(queue)}`
                );
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error getting queue: ${error.message}`);
        }
    };

    const testGetAllNotes = async () => {
        try {
            if (db?.getAllStudyNotes) {
                const notes = await db.getAllStudyNotes();
                addTestResult(`✅ Found ${notes.length} note(s) in IndexedDB`);
                notes.forEach((note, i) => {
                    addTestResult(
                        `   ${i + 1}. ${note.content?.substring(0, 50) || 'No content'}`
                    );
                });
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error getting notes: ${error.message}`);
        }
    };

    const testClearNotes = async () => {
        try {
            if (db?.clearStudyNotes) {
                await db.clearStudyNotes();
                addTestResult('✅ Cleared all notes from IndexedDB');
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error clearing notes: ${error.message}`);
        }
    };

    const testClearSyncQueue = async () => {
        try {
            if (db?.clearAllSyncQueue) {
                await db.clearAllSyncQueue();
                addTestResult('✅ Cleared sync queue');
            } else {
                addTestResult('❌ Database not ready');
            }
        } catch (error) {
            addTestResult(`❌ Error clearing queue: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Sync Status Banner with "Sync Now" button */}
            <SyncStatusBanner />

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Offline Sync Test Page
                </h1>

                {/* Status Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        System Status
                    </h2>
                    <div className="space-y-2">
                        <p>
                            <strong>DB Initialized:</strong>{' '}
                            <span
                                className={
                                    isInitialized
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {isInitialized ? '✅ Yes' : '❌ No'}
                            </span>
                        </p>
                        <p>
                            <strong>Online Status:</strong>{' '}
                            <span
                                className={
                                    syncStatus?.isOnline
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {syncStatus?.isOnline
                                    ? '🟢 Online'
                                    : '🔴 Offline'}
                            </span>
                        </p>
                        <p>
                            <strong>Syncing:</strong>{' '}
                            {syncStatus?.isSyncing ? '⏳ Yes' : 'No'}
                        </p>
                        <p>
                            <strong>Pending Items:</strong>{' '}
                            {syncStatus?.pendingCount || 0}
                        </p>
                    </div>
                </div>

                {/* Test Controls */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Test Controls
                    </h2>

                    {/* Add Note Test */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            Add Test Note to IndexedDB:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testNote}
                                onChange={(e) => setTestNote(e.target.value)}
                                placeholder="Enter a test note..."
                                className="flex-1 px-4 py-2 border rounded-md"
                            />
                            <button
                                onClick={testAddNote}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={testAddToSyncQueue}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Add to Sync Queue
                        </button>
                        <button
                            onClick={testGetSyncQueue}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            View Sync Queue
                        </button>
                        <button
                            onClick={testGetAllNotes}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            View All Notes
                        </button>
                        <button
                            onClick={testClearNotes}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Clear All Notes
                        </button>
                        <button
                            onClick={testClearSyncQueue}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                        >
                            Clear Sync Queue
                        </button>
                        <button
                            onClick={() => {
                                if (triggerSync) {
                                    triggerSync();
                                    addTestResult('🔄 Manual sync triggered');
                                } else {
                                    addTestResult('❌ Sync not available');
                                }
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                            Trigger Manual Sync
                        </button>
                        <button
                            onClick={() => setTestResults([])}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Clear Results
                        </button>
                    </div>
                </div>

                {/* Test Results */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
                        {testResults.length === 0 ? (
                            <p className="text-gray-500">
                                No tests run yet. Click buttons above to test
                                functionality.
                            </p>
                        ) : (
                            testResults.map((result, i) => (
                                <div key={i} className="mb-1">
                                    <span className="text-gray-500">
                                        [{result.time}]
                                    </span>{' '}
                                    {result.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        How to Test Offline Sync:
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>Check that DB is initialized (should be green)</li>
                        <li>Add some test notes while online</li>
                        <li>
                            Open DevTools → Network → Check &quot;Offline&quot;
                            checkbox
                        </li>
                        <li>
                            Watch the status change to &quot;Offline&quot; and
                            see the red banner appear
                        </li>
                        <li>
                            Add more notes or items to sync queue while offline
                        </li>
                        <li>Uncheck &quot;Offline&quot; in DevTools</li>
                        <li>
                            Watch the sync happen automatically (or click
                            &quot;Trigger Manual Sync&quot;)
                        </li>
                        <li>
                            Check sync queue - it should be empty after sync
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
