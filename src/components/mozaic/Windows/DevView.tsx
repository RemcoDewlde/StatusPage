import { useEffect, useRef, useState } from 'react';
import { useStatusPageStore } from '@/store/statusPageStore';
import { useApiSettingsStore } from '@/store/apiSettingsStore';
import { useMosaicStore } from '@/store/mosaicStore';
import MonacoEditor from '@monaco-editor/react';
import { exists } from '@tauri-apps/plugin-fs';
import { useApiDataStore } from '@/store/apiDataStore.ts';
import { useToastStore } from '@/store/toastStore.ts';
import { useDnDStore } from '@/store/dndStore.ts';
import { useRefreshStore } from '@/store/refreshStore.ts';

const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
};

export const DevView = () => {
    const data = useStatusPageStore((state) => state.data);
    const isLoading = useStatusPageStore((state) => state.isLoading);
    const error = useStatusPageStore((state) => state.error);
    const refreshInterval = useStatusPageStore((state) => state.refreshInterval);
    const setRefreshInterval = useStatusPageStore((state) => state.setRefreshInterval);
    const fetchStatusPage = useStatusPageStore((state) => state.fetchStatusPage);
    const forceRefresh = useStatusPageStore((state) => state.forceRefresh);
    const settings = useApiSettingsStore((state) => state.settings);

    const mosaic = {
        layout: useMosaicStore(s => s.layout),
        tiles: useMosaicStore(s => s.tiles),
        titles: useMosaicStore(s => s.titles),
    };

    // Track last updated timestamps and action log in local state
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [actionLog, setActionLog] = useState<string[]>([]);
    const lastUpdatedRef = useRef<Record<string, Date | null>>({});
    const [showMosaic, setShowMosaic] = useState(false);

    const [fsAccess, setFsAccess] = useState<{
        available: boolean;
        error?: string;
        testResult?: string;
    }>({ available: false });

    // === Zustand debug section state ===
    const [showZustand, setShowZustand] = useState(false);
    const [storeSnapshot, setStoreSnapshot] = useState<Record<string, unknown>>({});
    const [liveEnabled, setLiveEnabled] = useState(false);
    const liveUnsubsRef = useRef<Array<() => void>>([]);

    // Update last updated timestamps on data change
    Object.keys(data).forEach((pageId) => {
        if (data[pageId]) {
            lastUpdatedRef.current[pageId] = new Date();
        }
    });

    // Helper to log actions
    const logAction = (msg: string) => {
        setActionLog((log) => [
            `${new Date().toLocaleTimeString()} - ${msg}`,
            ...log.slice(0, 19), // keep last 20
        ]);
    };

    // Per-page actions
    const handleForceRefresh = async (pageId: string) => {
        logAction(`Force refresh for ${pageId}`);
        await fetchStatusPage(pageId);
    };
    const handleClearCache = (pageId: string) => {
        logAction(`Clear cache for ${pageId}`);
        // Clear data, error, and isLoading for this page
        useStatusPageStore.setState((state) => ({
            data: { ...state.data, [pageId]: null },
            error: { ...state.error, [pageId]: null },
            isLoading: { ...state.isLoading, [pageId]: false },
        }));
        lastUpdatedRef.current[pageId] = null;
    };

    // Polling interval change
    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            setRefreshInterval(val);
            logAction(`Set refresh interval to ${val} min`);
        }
    };

    useEffect(() => {
        const testFsAccess = async () => {
            try {
                await exists('.')
                setFsAccess({ available: true, testResult: 'Successfully accessed filesystem' });
            } catch (error) {
                setFsAccess({
                    available: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    testResult: 'Filesystem access denied or not available',
                });
            }
        };
        testFsAccess();
    }, []);

    // On-demand snapshot of key Zustand stores; functions are dropped by JSON.stringify
    const captureZustandSnapshot = () => {
        const snapshot = {
            statusPageStore: useStatusPageStore.getState(),
            apiSettingsStore: useApiSettingsStore.getState(),
            mosaicStore: useMosaicStore.getState(),
            dndStore: useDnDStore.getState(),
            refreshStore: useRefreshStore.getState(),
            // formDialogStore: useFormDialogStore.getState(),
            toastStore: useToastStore.getState(),
            apiDataStore: useApiDataStore.getState(),
        } as Record<string, unknown>;
        setStoreSnapshot(snapshot);
    };

    // Live mode: subscribe/unsubscribe to stores when toggled
    useEffect(() => {
        // Cleanup helper
        const cleanup = () => {
            if (liveUnsubsRef.current.length) {
                liveUnsubsRef.current.forEach((u) => {
                    try { u(); } catch {}
                });
                liveUnsubsRef.current = [];
            }
        };

        if (!liveEnabled) {
            cleanup();
            return;
        }

        // Start with a fresh snapshot
        captureZustandSnapshot();

        const addSub = <T extends object>(name: string, store: { subscribe: (fn: (state: T, prev: T) => void) => () => void }) => {
            const unsub = store.subscribe((state) => {
                setStoreSnapshot((prev) => ({ ...prev, [name]: state }));
            });
            liveUnsubsRef.current.push(unsub);
        };

        // Attach subscriptions
        addSub('statusPageStore', useStatusPageStore as any);
        addSub('apiSettingsStore', useApiSettingsStore as any);
        addSub('mosaicStore', useMosaicStore as any);
        addSub('dndStore', useDnDStore as any);
        addSub('refreshStore', useRefreshStore as any);
        addSub('toastStore', useToastStore as any);
        addSub('apiDataStore', useApiDataStore as any);

        return cleanup;
    }, [liveEnabled]);

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-2">StatusPage Store Debug View</h2>
            <div className="mb-2 flex items-center gap-4">
                <span className="font-semibold">Refresh Interval:</span>
                <input
                    type="number"
                    min={1}
                    value={refreshInterval}
                    onChange={handleIntervalChange}
                    className="border rounded px-2 py-1 w-16"
                />
                <span>min</span>
                <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => {
                    forceRefresh();
                    logAction('Force refresh all');
                }}>
                    Force Refresh All
                </button>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                    Mosaic Context
                    <button
                        className="ml-2 px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs border border-gray-300 hover:bg-gray-300"
                        onClick={() => setShowMosaic((v) => !v)}
                    >
                        {showMosaic ? 'Hide' : 'Show'}
                    </button>
                </h3>
                {showMosaic && (
                    <div className="bg-gray-100 p-2 rounded overflow-x-auto text-xs max-h-64 mb-4">
                        <MonacoEditor
                            height="250px"
                            defaultLanguage="json"
                            value={JSON.stringify({
                                layout: mosaic.layout,
                                tiles: mosaic.tiles,
                                titles: mosaic.titles,
                            }, null, 2)}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                fontSize: 12,
                                lineNumbers: 'on',
                                stickyScroll: { enabled: false },
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Zustand Stores Debug */}
            <div className="mb-4">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                    Zustand Stores
                    <button
                        className="ml-2 px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs border border-gray-300 hover:bg-gray-300"
                        onClick={() => setShowZustand((v) => !v)}
                    >
                        {showZustand ? 'Hide' : 'Show'}
                    </button>
                    {showZustand && (
                        <>
                            <button
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                onClick={captureZustandSnapshot}
                            >
                                Snapshot
                            </button>
                            <button
                                className={`px-2 py-1 rounded text-xs ${liveEnabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}
                                onClick={() => setLiveEnabled((v) => !v)}
                                title="Toggle live updates"
                            >
                                {liveEnabled ? 'Live: On' : 'Live: Off'}
                            </button>
                        </>
                    )}
                </h3>
                {showZustand && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(storeSnapshot).map(([name, state]) => (
                            <div key={name} className="bg-gray-100 p-2 rounded overflow-hidden">
                                <div className="text-xs font-semibold mb-1">{name}</div>
                                <MonacoEditor
                                    height="250px"
                                    defaultLanguage="json"
                                    value={JSON.stringify(state, (...args) => {
                                        const v = (args as [string, unknown])[1];
                                        return typeof v === 'function' ? '[Function]' : v;
                                    }, 2)}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        fontSize: 12,
                                        lineNumbers: 'on',
                                        stickyScroll: { enabled: false },
                                    }}
                                />
                            </div>
                        ))}
                        {Object.keys(storeSnapshot).length === 0 && (
                            <div className="text-xs text-gray-600">Click Snapshot to capture current store states.</div>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="font-semibold mb-1">Tracked Pages</h3>
                <ul className="divide-y divide-gray-200">
                    {settings.map((setting) => {
                        const pageId = setting.pageId;
                        const hasError = !!error[pageId];
                        const isStale = !isLoading[pageId] && !data[pageId];
                        return (
                            <li key={pageId}
                                className={`py-2 ${hasError ? 'bg-red-100' : isStale ? 'bg-yellow-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="font-mono text-xs text-blue-700 underline"
                                            onClick={() => setExpanded((exp) => ({ ...exp, [pageId]: !exp[pageId] }))}
                                        >
                                            {expanded[pageId] ? '▼' : '▶'}
                                        </button>
                                        <span className="font-mono text-xs">{pageId}</span>
                                        <span className="ml-2 text-sm text-gray-700">{setting.name}</span>
                                        {hasError && <span className="ml-2 text-xs text-red-600">Error</span>}
                                        {isStale && <span className="ml-2 text-xs text-yellow-600">Stale</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-2 py-1 bg-blue-400 text-white rounded text-xs"
                                                onClick={() => handleForceRefresh(pageId)}>
                                            Refresh
                                        </button>
                                        <button className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs"
                                                onClick={() => handleClearCache(pageId)}>
                                            Clear Cache
                                        </button>
                                        <span
                                            className="text-xs text-gray-500 ml-2">Last updated: {formatTime(lastUpdatedRef.current[pageId] || null)}</span>
                                    </div>
                                </div>
                                {expanded[pageId] && (
                                    <div className="bg-gray-100 p-2 mt-2 rounded overflow-x-auto text-xs"
                                         style={{ maxHeight: '70vh' }}>
                                        <MonacoEditor
                                            height="60vh"
                                            defaultLanguage="json"
                                            value={JSON.stringify({
                                                data: data[pageId],
                                                isLoading: isLoading[pageId],
                                                error: error[pageId],
                                            }, null, 2)}
                                            options={{
                                                readOnly: true,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                wordWrap: 'on',
                                                fontSize: 12,
                                                lineNumbers: 'on',
                                                stickyScroll: { enabled: false },
                                            }}
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-1">Recent Store Actions</h3>
                <ul className="bg-gray-50 p-2 rounded text-xs max-h-40 overflow-y-auto">
                    {actionLog.length === 0 && <li className="text-gray-400">No actions yet.</li>}
                    {actionLog.map((log, idx) => (
                        <li key={idx}>{log}</li>
                    ))}
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold mb-1">Tauri Filesystem Access</h3>
                <div
                    className={`p-2 rounded text-sm ${fsAccess.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center gap-2">
                        <span>{fsAccess.available ? '✅' : '❌'}</span>
                        <span>Status: {fsAccess.available ? 'Available' : 'Not Available'}</span>
                    </div>
                    {fsAccess.error && (
                        <div className="mt-1 text-xs">Error: {fsAccess.error}</div>
                    )}
                    {fsAccess.testResult && (
                        <div className="mt-1 text-xs">Test: {fsAccess.testResult}</div>
                    )}
                </div>
            </div>
        </div>
    );
};
