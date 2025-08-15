import { create } from 'zustand';

interface SettingsDialogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSettingsDialogStore = create<SettingsDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

