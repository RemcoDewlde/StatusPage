import { MosaicContextProps } from '@/context/MosaicContext.tsx';

const initialState: MosaicContextProps = {
    layout: "welcomeTile",
    tiles: {
        welcomeTile: { viewType: 'welcome', api: '', additionalSettings: {} },
    },
    titles: {
        welcomeTile: 'Welcome view',
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