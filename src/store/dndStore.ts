import { create } from 'zustand';

export type DropEdge = 'left'|'right'|'top'|'bottom';

interface DraggingTile {
  tileKind: string; // eg viewType or template id
  needsConfig?: boolean;
}

interface HoverState {
  targetId: string;
  edge: DropEdge;
}

interface DnDState {
  dragging?: DraggingTile;
  hover?: HoverState;
  startDrag: (tileKind: string, needsConfig?: boolean) => void;
  setHover: (targetId: string, edge: DropEdge) => void;
  clearHover: () => void;
  endDrag: () => void;
}

export const useDnDStore = create<DnDState>((set) => ({
  dragging: undefined,
  hover: undefined,
  startDrag: (tileKind, needsConfig) => set({ dragging: { tileKind, needsConfig }}),
  setHover: (targetId, edge) => set((s) => s.dragging ? { hover: { targetId, edge }} : s),
  clearHover: () => set({ hover: undefined }),
  endDrag: () => set({ dragging: undefined, hover: undefined }),
}));
