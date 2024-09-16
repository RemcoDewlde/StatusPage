import DEFAULT_LAYOUT from '@/Defaults/DefaultMosaicLayout.ts';
import { MosaicContextProps } from '@/context/MosaicContext.tsx';

// TODO: Replace this with explanation tiles on how to use the app
const initialState: MosaicContextProps = {
    layout: DEFAULT_LAYOUT,
    tiles: {
        tile1: { viewType: 'summary', api: '/api/summary', additionalSettings: {} },
        tile2: { viewType: 'details', api: '/api/details', additionalSettings: {} },
        tile3: { viewType: 'graph', api: '/api/graph', additionalSettings: {} },
    },
    titles: {
        tile1: 'Summary View',
        tile2: 'Details View',
        tile3: 'Graph View',
    },
    addTile: () => {
    },
    updateTile: () => {
    },
    removeTile: () => {
    },
    setLayout: () => {
    },
};

export default initialState;
