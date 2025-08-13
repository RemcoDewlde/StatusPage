// filepath: /Users/remcodewilde/Documents/Dev/personal/StatusPage/src/store/toastStore.ts
import { create } from 'zustand';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  closable?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, closable?: boolean) => void;
  removeToast: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type, closable) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set((state) => ({ toasts: [...state.toasts, { id, message, type, closable }] }));
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export {};
