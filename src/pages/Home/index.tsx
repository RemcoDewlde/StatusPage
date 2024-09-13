import { ApiAction, useApi } from '../../context/apiContext.tsx';
import { useEffect, useState } from 'react';
import { useToast } from '../../context/toastContext.tsx';
import { LayOutType, PageSetting, PageSettingType } from '@/utils/types.ts';
import './index.css';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import type { TileSettings, ViewId } from '@/utils/types.ts';
import TileSettingsForm from "@/components/TileSettingsForm.tsx";

const DEFAULT_LAYOUT: MosaicNode<ViewId> = {
    direction: 'row',
    first: 'tile1',
    second: {
        direction: 'column',
        first: 'tile2',
        second: 'tile3',
    },
};

const Home = () => {
    const { fetchStatusPageData } = useApi();
    const [settings, setSettings] = useState<PageSetting[]>([]);
    // @ts-ignore
    const [status, setStatusData] = useState<{ [key: string]: any }>({});
    const [mosaicState, setMosaicState] = useState<MosaicNode<ViewId> | null>(DEFAULT_LAYOUT);
    const { addToast } = useToast();

    // Manage titles dynamically
    const [titleMap, setTitleMap] = useState<Record<ViewId, string>>({
        tile1: 'Left Window',
        tile2: 'Top Right Window',
        tile3: 'Bottom Right Window',
    });

    const [tileCounter, setTileCounter] = useState(3);
    const [tileSettings, setTileSettings] = useState<Record<ViewId, TileSettings>>({});

    // State for adding new tile
    const [isFormOpen, setIsFormOpen] = useState(false);

    // State for editing existing tile settings
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [currentTileId, setCurrentTileId] = useState<ViewId | null>(null);

    useEffect(() => {
        loadLayout();
        fetchSettings();
    }, []);

    const loadLayout = async () => {
        // Should probably be wrapped in a try-catch block since messing up the saved state is still a possibility
        const loadedData = await LayOutType.load(addToast);
        if (loadedData) {
            console.log(loadedData.layout)

            setMosaicState(loadedData.layout);
            // setMosaicState(DEFAULT_LAYOUT);

            setTileSettings(loadedData.tileSettings);
            setTitleMap(loadedData.titleMap);
            setTileCounter(Object.keys(loadedData.tileSettings).length);
        } else {
            // Initialize with default layout and counters
            setMosaicState(DEFAULT_LAYOUT);
            setTileCounter(3);
            setTitleMap({
                tile1: 'Left Window',
                tile2: 'Top Right Window',
                tile3: 'Bottom Right Window',
            });
        }
    };

    const fetchSettings = async () => {
        const loadedSettings = await PageSettingType.load(addToast);
        if (loadedSettings) {
            setSettings(loadedSettings.settings);
        }
    };

    const saveLayout = async (newLayout: MosaicNode<ViewId> | null) => {
        if (!newLayout) {
            return;
        }

        const layoutToSave = new LayOutType(newLayout, tileSettings, titleMap);
        await LayOutType.save(layoutToSave);
    };

    const fetchDataForSettings = async () => {
        const newStatusData: { [key: string]: any } = {};
        for (const setting of settings) {
            try {
                newStatusData[setting.pageId] = await fetchStatusPageData(setting.pageId, ApiAction.Summary);
            } catch (error) {
                console.error(`Error fetching summary for ${setting.pageId}:`, error);
            }
        }
        setStatusData(newStatusData);
    };

    useEffect(() => {
        if (settings.length > 0) {
            fetchDataForSettings();
        }
    }, [settings]);

    const onChange = (newLayout: MosaicNode<ViewId> | null) => {
        saveLayout(newLayout).then(() => {
            setMosaicState(newLayout);
        });
    };

    const createNewTile = (settings: TileSettings) => {
        let uuid = self.crypto.randomUUID();
        const newTileId = `tile${uuid}`;
        setTileCounter(prev => prev + 1);

        setTitleMap(prev => ({
            ...prev,
            [newTileId]: `Tile ${tileCounter + 1}`,
        }));

        setTileSettings(prev => ({
            ...prev,
            [newTileId]: settings,
        }));

        const updatedLayout: MosaicNode<ViewId> = {
            direction: 'row',
            // @ts-ignore
            first: mosaicState,
            second: newTileId,
        };

        setMosaicState(updatedLayout);
        saveLayout(updatedLayout);
    };

    const removeTile = (tileId: ViewId) => {
        const updatedLayout = removeNode(mosaicState, tileId);
        if (updatedLayout !== mosaicState) {
            setMosaicState(updatedLayout);

            // Remove tile settings and title
            setTileSettings(prev => {
                const { [tileId]: _, ...rest } = prev;
                return rest;
            });
            setTitleMap(prev => {
                const { [tileId]: _, ...rest } = prev;
                return rest;
            });

            saveLayout(updatedLayout);
        }
    };

    const removeNode = (currentNode: MosaicNode<ViewId> | null, nodeToRemove: ViewId): MosaicNode<ViewId> | null => {
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

    const handleAddTileClick = () => {
        setIsFormOpen(true);
    };

    const handleFormSubmit = (settings: TileSettings) => {
        console.log(settings)
        createNewTile(settings);
        setIsFormOpen(false);
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
    };

    const openSettingsModal = (tileId: ViewId) => {
        setCurrentTileId(tileId);
        setIsSettingsModalOpen(true);
    };

    const closeSettingsModal = () => {
        setCurrentTileId(null);
        setIsSettingsModalOpen(false);
    };

    const handleSettingsSubmit = (updatedSettings: TileSettings) => {
        if (currentTileId) {
            setTileSettings(prev => ({
                ...prev,
                [currentTileId]: updatedSettings,
            }));
            saveLayout(mosaicState);
        }
        closeSettingsModal();
    };

    return (
        <div className="custom-layout-container">
            <button onClick={handleAddTileClick}>Add New Tile</button>

            {isFormOpen && (
                <TileSettingsForm
                    // @ts-ignore
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            {isSettingsModalOpen && currentTileId && (
                <TileSettingsForm
                    // @ts-ignore
                    onSubmit={handleSettingsSubmit}
                    onCancel={closeSettingsModal}
                    initialSettings={tileSettings[currentTileId]}
                />
            )}

            <Mosaic<ViewId>
                renderTile={(id, path) => {
                    const settings = tileSettings[id];

                    if (!settings) {
                        return (
                            <MosaicWindow<ViewId>
                                path={path}
                                title={titleMap[id] || 'Untitled'}
                            >
                                <div>
                                    <h1>{titleMap[id] || 'Untitled'}</h1>
                                    <button onClick={() => removeTile(id)}>Remove</button>
                                </div>
                            </MosaicWindow>
                        );
                    }

                    // Render different components based on settings.viewType
                    let ContentComponent;

                    switch (settings.viewType) {
                        case 'summary':
                            ContentComponent = <SummaryView api={settings.api} />;
                            break;
                        case 'details':
                            ContentComponent = <DetailsView api={settings.api} />;
                            break;
                        case 'graph':
                            ContentComponent = <GraphView api={settings.api} />;
                            break;
                        default:
                            ContentComponent = <div>Unknown View</div>;
                    }

                    return (
                        <MosaicWindow<ViewId>
                            path={path}
                            title={titleMap[id] || 'Untitled'}
                        >
                            <div>
                                {ContentComponent}
                                <button onClick={() => removeTile(id)}>Remove</button>
                                <button onClick={() => openSettingsModal(id)}>Settings</button>
                            </div>
                        </MosaicWindow>
                    );
                }}
                resize={{ minimumPaneSizePercentage: 10 }}
                zeroStateView={<div className="zero-state">No Tiles Available</div>}
                value={mosaicState}
                onChange={onChange}
                initialValue={mosaicState}
            />
        </div>
    );
};

export default Home;

export const SummaryView = (props: { api: string }) => {
    return (
        <div>
            <h1>Summary View</h1>
            <p>API: {props.api}</p>
        </div>
    );
}

export const DetailsView = (props: { api: string }) => {
    return (
        <div>
            <h1>Details View</h1>
            <p>API: {props.api}</p>
        </div>
    );
}

export const GraphView = (props: { api: string }) => {
    return (
        <div>
            <h1>Graph View</h1>
            <p>API: {props.api}</p>
        </div>
    );
}