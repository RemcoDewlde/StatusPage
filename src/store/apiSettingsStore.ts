import { create } from 'zustand';
import { PageSetting } from '@/utils/types';

interface ApiSettingsState {
  settings: PageSetting[];
  setSettings: (settings: PageSetting[]) => void;
  updateSetting: (pageId: string, update: Partial<PageSetting>) => void;
  getSettingById: (pageId: string) => PageSetting | undefined;
}

export const useApiSettingsStore = create<ApiSettingsState>((set, get) => ({
  settings: [],
  setSettings: (settings) => set({ settings }),
  updateSetting: (pageId, update) => set(state => ({
    settings: state.settings.map(s => s.pageId === pageId ? { ...s, ...update } : s)
  })),
  getSettingById: (pageId) => get().settings.find(s => s.pageId === pageId),
}));

