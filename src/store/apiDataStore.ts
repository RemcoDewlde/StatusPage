import { create } from 'zustand';
import { ApiAction } from '@/enums/apiActions.enum';
import { StatusPageData } from '@/interfaces/statusPageData.interface';
import { invoke } from '@tauri-apps/api/core';
import { useApiSettingsStore } from './apiSettingsStore';

interface ApiDataState {
  statusPageData: Record<string, StatusPageData | null>;
  fetchStatusPageData: (pageId: string, action: ApiAction) => Promise<StatusPageData>;
}

export const useApiDataStore = create<ApiDataState>(() => ({
  statusPageData: {},
  fetchStatusPageData: async (pageId: string, action: ApiAction) => {
    const pageSetting = useApiSettingsStore.getState().getSettingById(pageId);
    const invokeArgs: Record<string, any> = {
      pageId,
      action: action.toString(),
      isCustomDomain: pageSetting?.isCustomDomain ?? false,
    };
    const data = await invoke<StatusPageData>('fetch_statuspage_data', invokeArgs);
    useApiDataStore.setState((state) => ({
      statusPageData: { ...state.statusPageData, [pageId]: data },
    }));
    return data;
  },
}));

