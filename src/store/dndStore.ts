import { create } from 'zustand';

export type DropEdge = 'left' | 'right' | 'top' | 'bottom';

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

export const useDnDStore = create<DnDState>(set => ({
    dragging: undefined,
    hover: undefined,
    startDrag: (tileKind, needsConfig) => set({ dragging: { tileKind, needsConfig } }),
    setHover: (targetId, edge) =>
        set(s => {
            if (!s.dragging) return s;
            if (s.hover && s.hover.targetId === targetId && s.hover.edge === edge) return s; // no-op
            return { hover: { targetId, edge } };
        }),
    clearHover: () =>
        set(s => {
            if (!s.hover) return s; // no-op
            return { hover: undefined };
        }),
    endDrag: () =>
        set(s => {
            if (!s.dragging && !s.hover) return s; // no-op if already reset
            return { dragging: undefined, hover: undefined };
        }),
}));
