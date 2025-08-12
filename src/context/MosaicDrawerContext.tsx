import { createContext, useContext, ReactNode } from 'react';
import { useMosaicStore } from '@/stores/useMosaicStore';

interface MosaicDrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MosaicDrawerContext = createContext<MosaicDrawerContextType | undefined>(undefined);

export const MosaicDrawerProvider = ({ children }: { children: ReactNode }) => {
  // Get the drawer state from the Zustand store instead of local state
  const { drawerOpen, setDrawerOpen } = useMosaicStore();

  return (
    <MosaicDrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </MosaicDrawerContext.Provider>
  );
};

export const useMosaicDrawer = () => {
  const ctx = useContext(MosaicDrawerContext);
  if (!ctx) throw new Error('useMosaicDrawer must be used within MosaicDrawerProvider');
  return ctx;
};
