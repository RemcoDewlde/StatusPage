import { createContext, useContext, useState, ReactNode } from 'react';

interface MosaicDrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const MosaicDrawerContext = createContext<MosaicDrawerContextType | undefined>(undefined);

export const MosaicDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
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

