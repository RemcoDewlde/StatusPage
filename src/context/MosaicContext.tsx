import { MosaicNode } from 'react-mosaic-component';
import { LayOutType, TileSettings, ViewId } from '@/utils/types';
import { createContext, FC, ReactNode, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import initialState from '@/Defaults/DefaultMosaicState.ts';

export interface MosaicContextProps {
    layout: MosaicNode<ViewId> | null;
    tiles: Record<ViewId, TileSettings>;
    titles: Record<ViewId, string>;
    addTile: (settings: TileSettings, title?: string) => void;
    updateTile: (id: ViewId, settings: TileSettings) => void;
    removeTile: (id: ViewId) => void;
    setLayout: (layout: MosaicNode<ViewId> | null) => void;
}

type Action =
    | { type: 'ADD_TILE'; payload: { settings: TileSettings; title?: string } }
    | { type: 'UPDATE_TILE'; payload: { id: ViewId; settings: TileSettings } }
    | { type: 'REMOVE_TILE'; payload: { id: ViewId } }
    | {
    type: 'SET_LAYOUT'; payload: {
        layout: MosaicNode<ViewId> | null;
        tiles?: MosaicContextProps['tiles'];
        titles?: MosaicContextProps['titles'];
    };
}
    | {
    type: 'SET_STATE';
    payload: {
        layout: MosaicNode<ViewId> | null;
        tiles: Record<ViewId, TileSettings>;
        titles: Record<ViewId, string>;
    };
};

const MosaicContext = createContext<MosaicContextProps | undefined>(undefined);

const mosaicReducer = (
    state: typeof initialState,
    action: Action,
): typeof initialState => {
    switch (action.type) {
        case 'ADD_TILE': {
            const { settings, title } = action.payload;
            const id = `tile-${uuid()}`; // Generate a unique ID for the new tile
            const newTitle = title || `Tile ${Object.keys(state.tiles).length + 1}`;
            let newLayout: MosaicNode<ViewId> = state.layout
                ? {
                    direction: 'row',
                    first: state.layout,
                    second: id,
                }
                : id;

            return {
                ...state,
                tiles: { ...state.tiles, [id]: settings },
                titles: { ...state.titles, [id]: newTitle },
                layout: newLayout,
            };
        }
        case 'UPDATE_TILE': {
            const { id, settings } = action.payload;
            if (!state.tiles[id]) return state;
            return {
                ...state,
                tiles: { ...state.tiles, [id]: settings },
            };
        }
        case 'REMOVE_TILE': {
            const { id } = action.payload;
            const { [id]: removedTile, ...remainingTiles } = state.tiles;
            const { [id]: removedTitle, ...remainingTitles } = state.titles;

            const updatedLayout = removeNode(state.layout, id);

            return {
                ...state,
                tiles: remainingTiles,
                titles: remainingTitles,
                layout: updatedLayout || null,
            };
        }
        case 'SET_LAYOUT': {
            const { layout } = action.payload;
            return {
                ...state,
                layout,
            };
        }
        case 'SET_STATE': {
            const { layout, tiles, titles } = action.payload;
            return {
                ...state,
                layout,
                tiles,
                titles,
            };
        }
        default:
            return state;
    }
};

// Helper function to remove a node from the mosaic layout
const removeNode = (
    currentNode: MosaicNode<ViewId> | null,
    nodeToRemove: ViewId,
): MosaicNode<ViewId> | null => {
    if (!currentNode) return null;

    if (typeof currentNode === 'string') {
        return currentNode === nodeToRemove ? null : currentNode;
    }

    const first = removeNode(currentNode.first, nodeToRemove);
    const second = removeNode(currentNode.second, nodeToRemove);

    if (first === null && second === null) {
        return null;
    }
    if (first === null) {
        return second;
    }
    if (second === null) {
        return first;
    }

    return { ...currentNode, first, second };
};

interface MosaicProviderProps {
    children: ReactNode;
}

export const MosaicProvider: FC<MosaicProviderProps> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [reducerState, dispatch] = useReducer(mosaicReducer, initialState);

    const initializeState = async () => {
        let savedState = await LayOutType.load();
        if (savedState) {
            dispatch({
                type: 'SET_STATE',
                payload: {
                    layout: savedState.layout,
                    tiles: savedState.tileSettings,
                    titles: savedState.titleMap,
                },
            });
        }
        setIsInitialized(true);
        setIsLoaded(true);
    };

    useEffect(() => {
        if (!isLoaded) {
            initializeState();
        }
    }, [isLoaded]);

    // Debounce delay in milliseconds
    const SAVE_DEBOUNCE_DELAY = 500;
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced save effect
    useEffect(() => {
        if (isInitialized) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                saveState(reducerState);
                saveTimeoutRef.current = null;
            }, SAVE_DEBOUNCE_DELAY);
        }

        // Cleanup function to clear timeout if component unmounts or dependencies change
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [reducerState, isInitialized]);

    const addTile = (settings: TileSettings, title?: string) => {
        dispatch({ type: 'ADD_TILE', payload: { settings, title } });
    };

    const updateTile = (id: ViewId, settings: TileSettings) => {
        dispatch({ type: 'UPDATE_TILE', payload: { id, settings } });
    };

    const removeTile = (id: ViewId) => {
        dispatch({ type: 'REMOVE_TILE', payload: { id } });
    };

    const setLayout = (layout: MosaicNode<ViewId> | null) => {
        dispatch({ type: 'SET_LAYOUT', payload: { layout } });
    };

    return (
        <MosaicContext.Provider
            value={{
                layout: reducerState.layout,
                tiles: reducerState.tiles,
                titles: reducerState.titles,
                addTile,
                updateTile,
                removeTile,
                setLayout,
            }}
        >
            {children}
        </MosaicContext.Provider>
    );
};

const saveState = async (state: typeof initialState) => {
    const layoutType = new LayOutType(state.layout, state.tiles, state.titles);
    try {
        await LayOutType.save(layoutType);
    } catch (error) {
        console.error('Error saving mosaic layout state:', error);
    }
};

export const useMosaic = (): MosaicContextProps => {
    const context = useContext(MosaicContext);
    if (!context) {
        throw new Error('useMosaic must be used within a MosaicProvider');
    }
    return context;
};
