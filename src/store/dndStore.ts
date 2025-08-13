import { create } from 'zustand';

export type DropEdge = 'left'|'right'|'top'|'bottom';

interface DraggingTile {
  tileKind: string; // eg viewType or template id
}

interface HoverState {
  targetId: string;
  edge: DropEdge;
}

interface DnDState {
  dragging?: DraggingTile;
  hover?: HoverState;
  startDrag: (tileKind: string) => void;
  setHover: (targetId: string, edge: DropEdge) => void;
  clearHover: () => void;
  endDrag: () => void;
}

export const useDnDStore = create<DnDState>((set) => ({
  dragging: undefined,
  hover: undefined,
  startDrag: (tileKind) => set((s) => {
    // Avoid resetting if already dragging same kind
    if (s.dragging?.tileKind === tileKind) return s;
    return { dragging: { tileKind } };
  }),
  setHover: (targetId, edge) => set((s) => {
    // Only set hover when a drag is active
    if (!s.dragging) return s;
    // Skip if hover didn't actually change
    if (s.hover && s.hover.targetId === targetId && s.hover.edge === edge) return s;
    return { hover: { targetId, edge } };
  }),
  clearHover: () => set((s) => (s.hover ? { hover: undefined } : s)),
  endDrag: () => set((s) => (s.dragging || s.hover ? { dragging: undefined, hover: undefined } : s)),
}));
