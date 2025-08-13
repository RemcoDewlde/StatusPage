const initialState = {
    layout: 'welcomeTile' as const,
    tiles: {
        welcomeTile: { viewType: 'welcome', api: '', additionalSettings: {} },
    } as Record<string, { viewType: string; api: string; additionalSettings: any }>,
    titles: {
        welcomeTile: 'Welcome view',
    } as Record<string, string>,
    // No-op placeholders (legacy context compatibility)
    addTile: () => {},
    updateTile: () => {},
    removeTile: () => {},
    setLayout: () => {},
};

export default initialState;
