import { create } from 'zustand';
import { MosaicNode } from 'react-mosaic-component';
import { LayOutType, TileSettings } from '@/utils/types';
import initialDefault from '@/defaults/DefaultMosaicState';
import { v4 as uuid } from 'uuid';

interface MosaicState {
  layout: MosaicNode<string> | null;
  tiles: Record<string, TileSettings>;
  titles: Record<string, string>;
  hydrated: boolean;
  addTile: (settings: TileSettings, title?: string) => void;
  updateTile: (id: string, settings: TileSettings, title?: string) => void;
  removeTile: (id: string) => void;
  setLayout: (layout: MosaicNode<string> | null) => void;
  hydrate: () => Promise<void>;
  addTileRelative?: (targetId: string, edge: 'left'|'right'|'top'|'bottom', settings: TileSettings, title?: string) => void;
}

// Helper to remove node from mosaic tree
const removeNode = (currentNode: MosaicNode<string> | null, nodeToRemove: string): MosaicNode<string> | null => {
  if (!currentNode) return null;
  if (typeof currentNode === 'string') return currentNode === nodeToRemove ? null : currentNode;
  const first = removeNode(currentNode.first, nodeToRemove);
  const second = removeNode(currentNode.second, nodeToRemove);
  if (first === null && second === null) return null;
  if (first === null) return second;
  if (second === null) return first;
  return { ...currentNode, first, second } as MosaicNode<string>;
};

// Non-null recursive insert that preserves MosaicNode<string> typing
const insertRelativeNonNull = (layout: MosaicNode<string>, targetId: string, newNode: MosaicNode<string>): MosaicNode<string> => {
  if (typeof layout === 'string') {
    return layout === targetId ? newNode : layout;
  }
  return {
    ...layout,
    first: insertRelativeNonNull(layout.first, targetId, newNode),
    second: insertRelativeNonNull(layout.second, targetId, newNode),
  };
};

const insertRelative = (layout: MosaicNode<string> | null, targetId: string, newNode: MosaicNode<string>): MosaicNode<string> | null => {
  if (!layout) return null;
  return insertRelativeNonNull(layout, targetId, newNode);
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_DELAY = 500;

export const useMosaicStore = create<MosaicState>((set, get) => ({
  layout: initialDefault.layout,
  tiles: initialDefault.tiles,
  titles: initialDefault.titles,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return; // avoid double
    try {
      const saved = await LayOutType.load();
      if (saved) {
        set({
          layout: saved.layout,
          tiles: saved.tileSettings,
          titles: saved.titleMap,
          hydrated: true,
        });
      } else {
        set({ hydrated: true });
      }
    } catch (e) {
      console.error('Failed to hydrate mosaic store', e);
      set({ hydrated: true });
    }
  },
  addTile: (settings, title) => {
    const state = get();
    const id = `tile-${uuid()}`;
    const newTitle = title || `Tile ${Object.keys(state.tiles).length + 1}`;
    const newLayout: MosaicNode<string> = state.layout
      ? { direction: 'row', first: state.layout, second: id }
      : id;
    set({
      tiles: { ...state.tiles, [id]: settings },
      titles: { ...state.titles, [id]: newTitle },
      layout: newLayout,
    });
  },
  updateTile: (id, settings, title) => {
    const state = get();
    if (!state.tiles[id]) return;
    set({
      tiles: { ...state.tiles, [id]: settings },
      titles: title !== undefined ? { ...state.titles, [id]: title } : state.titles,
    });
  },
  removeTile: (id) => {
    const state = get();
    if (!state.tiles[id]) return;
    const { [id]: _, ...remainingTiles } = state.tiles;
    const { [id]: __, ...remainingTitles } = state.titles;
    const updatedLayout = removeNode(state.layout, id) || null;
    set({ tiles: remainingTiles, titles: remainingTitles, layout: updatedLayout });
  },
  setLayout: (layout) => set({ layout }),
  addTileRelative: (targetId, edge, settings, title) => {
    const state = get();
    if (!state.tiles[targetId]) return;
    const id = `tile-${uuid()}`;
    const newTitle = title || `Tile ${Object.keys(state.tiles).length + 1}`;
    let direction: 'row'|'column';
    let first: MosaicNode<string>; let second: MosaicNode<string>;
    switch(edge){
      case 'left':
        direction='row'; first=id; second=targetId; break;
      case 'right':
        direction='row'; first=targetId; second=id; break;
      case 'top':
        direction='column'; first=id; second=targetId; break;
      case 'bottom':
        direction='column'; first=targetId; second=id; break;
    }
    const newParent: MosaicNode<string> = { direction, first, second } as any;
    const newLayout = insertRelative(state.layout, targetId, newParent) || newParent;
    set({
      tiles: { ...state.tiles, [id]: settings },
      titles: { ...state.titles, [id]: newTitle },
      layout: newLayout,
    });
  },
}));

// Debounced persistence subscription
useMosaicStore.subscribe((state) => {
  if (!state.hydrated) return; // don't save before hydration
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      const layoutType = new LayOutType(state.layout, state.tiles, state.titles);
      await LayOutType.save(layoutType);
    } catch (e) {
      console.error('Error saving mosaic layout state:', e);
    }
  }, SAVE_DEBOUNCE_DELAY);
});
