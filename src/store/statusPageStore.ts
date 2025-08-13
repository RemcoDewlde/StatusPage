import { create } from 'zustand';
import { StatusPageData } from '@/interfaces/statusPageData.interface';
import { ApiAction } from '@/enums/apiActions.enum';
import { invoke } from '@tauri-apps/api/core';
import { useApiSettingsStore } from '@/store/apiSettingsStore';

interface StatusPageStoreState {
  data: Record<string, StatusPageData | null>;
  isLoading: Record<string, boolean>;
  error: Record<string, string | null>;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  fetchStatusPage: (pageId: string) => Promise<void>;
  forceRefresh: () => void;
}

export const useStatusPageStore = create<StatusPageStoreState>((set, get) => {
  let intervalId: NodeJS.Timeout | null = null;

  const fetchStatusPage = async (pageId: string) => {
    set((state) => ({
      isLoading: { ...state.isLoading, [pageId]: true },
      error: { ...state.error, [pageId]: null },
    }));
    try {
      const pageSetting = useApiSettingsStore.getState().getSettingById(pageId);
      const invokeArgs: Record<string, any> = {
        pageId,
        action: ApiAction.Components.toString(),
        isCustomDomain: pageSetting?.isCustomDomain ?? false,
      };
      const data = await invoke<StatusPageData>('fetch_statuspage_data', invokeArgs);
      set((state) => ({
        data: { ...state.data, [pageId]: data },
        isLoading: { ...state.isLoading, [pageId]: false },
        error: { ...state.error, [pageId]: null },
      }));
    } catch (error: any) {
      set((state) => ({
        isLoading: { ...state.isLoading, [pageId]: false },
        error: { ...state.error, [pageId]: error?.message || 'Error' },
      }));
    }
  };

  const pollAll = () => {
    const settings = useApiSettingsStore.getState().settings;
    if (!settings.length) return; // avoid unnecessary work
    settings.forEach((setting) => {
      get().fetchStatusPage(setting.pageId);
    });
  };

  const setRefreshInterval = (interval: number) => {
    set({ refreshInterval: interval });
    if (intervalId) clearInterval(intervalId);
    if (interval > 0) {
      intervalId = setInterval(pollAll, interval * 60 * 1000);
    }
  };

  const forceRefresh = () => {
    pollAll();
  };

  return {
    data: {},
    isLoading: {},
    error: {},
    refreshInterval: 5,
    setRefreshInterval,
    fetchStatusPage,
    forceRefresh,
  };
});

// Subscribe to settings changes to fetch newly added pages
let previousIds: Set<string> = new Set();
useApiSettingsStore.subscribe((state) => {
  const currentIds = new Set(state.settings.map(s => s.pageId));
  // Determine new ids
  const newIds: string[] = [];
  currentIds.forEach(id => { if (!previousIds.has(id)) newIds.push(id); });
  previousIds = currentIds;
  if (newIds.length) {
    const fetch = useStatusPageStore.getState().fetchStatusPage;
    newIds.forEach(id => fetch(id));
  }
});
