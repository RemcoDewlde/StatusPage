import { create } from 'zustand';

type DraggedItem = { viewType: string; label: string } | null;
type DropPosition = { x: number; y: number } | null;

interface MosaicState {
  // Drawer state
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  
  // Drag state
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedItem: DraggedItem;
  setDraggedItem: (item: DraggedItem) => void;
  
  // Position tracking
  dropPosition: DropPosition;
  setDropPosition: (position: DropPosition) => void;
  
  // Drop handling
  handleDrop: (item: any, position?: DropPosition) => void;
  setDropHandler: (handler: (item: any, position?: DropPosition) => void) => void;
}

export const useMosaicStore = create<MosaicState>((set) => ({
  // Drawer state
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  
  // Drag state
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  draggedItem: null,
  setDraggedItem: (item) => set({ draggedItem: item }),
  
  // Position tracking
  dropPosition: null,
  setDropPosition: (position) => set({ dropPosition: position }),
  
  // Drop handling
  handleDrop: (item, position) => {
    console.log("Drop detected but no handler set", item, position);
    set({ isDragging: false, draggedItem: null, dropPosition: null });
  },
  setDropHandler: (handler) => set({ 
    handleDrop: (item, position) => {
      handler(item, position);
      set({ isDragging: false, draggedItem: null, dropPosition: null });
    } 
  }),
}));
