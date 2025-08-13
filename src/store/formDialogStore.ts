import { create } from 'zustand';

interface FormDialogState {
  isOpen: boolean;
  editingTileId: string | null;
  openDialog: (tileId?: string) => void;
  closeDialog: () => void;
}

export const useFormDialogStore = create<FormDialogState>((set) => ({
  isOpen: false,
  editingTileId: null,
  openDialog: (tileId) => set({ isOpen: true, editingTileId: tileId ?? null }),
  closeDialog: () => set({ isOpen: false, editingTileId: null }),
}));

