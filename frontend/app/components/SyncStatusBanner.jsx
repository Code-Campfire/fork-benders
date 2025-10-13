'use client';

import { useDB } from '../../lib/DBProvider';

export default function SyncStatusBanner() {
    const { syncStatus, triggerSync } = useDB();

    if (!syncStatus) {
        return null;
    }

    const { pendingCount, isOnline, isSyncing } = syncStatus;

    // Don't show banner if nothing pending and online
    if (pendingCount === 0 && isOnline) {
        return null;
    }

    const handleSyncClick = async () => {
        if (triggerSync) {
            await triggerSync();
        }
    };

    return (
        <div
            style={{
                padding: '12px 16px',
                backgroundColor: isOnline ? '#fef3c7' : '#fee2e2',
                borderBottom: '1px solid',
                borderColor: isOnline ? '#fbbf24' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>
                    {isOnline ? '⚠️' : '📡'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {!isOnline && 'Offline: '}
                    {pendingCount > 0
                        ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending sync`
                        : 'Offline mode'}
                </span>
            </div>

            {isOnline && pendingCount > 0 && (
                <button
                    onClick={handleSyncClick}
                    disabled={isSyncing}
                    style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        backgroundColor: isSyncing ? '#d1d5db' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSyncing ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                    }}
                >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
            )}
        </div>
    );
}
