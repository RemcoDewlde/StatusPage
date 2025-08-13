import { create } from 'zustand';
import { IntervalType } from '@/utils/types';
import { useStatusPageStore } from './statusPageStore';

interface RefreshState {
  refreshInterval: number; // minutes
  refreshSignal: number;
  hydrated: boolean;
  setRefreshInterval: (interval: number) => Promise<void>;
  hydrate: () => Promise<void>;
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export const useRefreshStore = create<RefreshState>((set, get) => ({
  refreshInterval: 5,
  refreshSignal: 0,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const loaded = await IntervalType.load();
      if (loaded) {
        set({ refreshInterval: loaded.interval, hydrated: true });
        // propagate to statusPage polling
        useStatusPageStore.getState().setRefreshInterval(loaded.interval);
      } else {
        set({ hydrated: true });
      }
    } catch (e) {
      console.error('Error hydrating refresh store', e);
      set({ hydrated: true });
    }
  },
  setRefreshInterval: async (interval: number) => {
    set({ refreshInterval: interval });
    try {
      await IntervalType.save(new IntervalType(interval));
    } catch (e) {
      console.error('Error saving refresh interval', e);
    }
    // propagate to status page store
    useStatusPageStore.getState().setRefreshInterval(interval);
  },
}));

// Subscription for auto increment refreshSignal (poll trigger for components needing manual refresh effect)
useRefreshStore.subscribe((state, prev) => {
  if (!state.hydrated) return;
  if (state.refreshInterval !== prev.refreshInterval) {
    if (intervalHandle) clearInterval(intervalHandle);
    if (state.refreshInterval > 0) {
      intervalHandle = setInterval(() => {
        useRefreshStore.setState((s) => ({ refreshSignal: s.refreshSignal + 1 }));
      }, state.refreshInterval * 60 * 1000);
    }
  }
});

