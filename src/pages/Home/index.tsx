import { ApiAction, useApi } from '../../context/apiContext.tsx';
import { useEffect, useState } from 'react';
import { useToast } from '../../context/toastContext.tsx';
import { LayOutType, PageSetting, PageSettingType } from '@/utils/types.ts';
import './index.css';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

// Use ViewId for both layout and mosaic component
type ViewId = 'tile1' | 'tile2' | 'tile3';

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
    const [status, setStatusData] = useState<{ [key: string]: any }>({});
    const [mosaicState, setMosaicState] = useState<MosaicNode<any>>(DEFAULT_LAYOUT);
    const { addToast } = useToast();

    useEffect(() => {
        loadLayout();
        fetchSettings();
    }, []);

    const loadLayout = async () => {
        const loadedLayout = await LayOutType.load();
        if (loadedLayout) {
            setMosaicState(loadedLayout.settings);
        }
    };

    const fetchSettings = async () => {
        const loadedSettings = await PageSettingType.load(addToast);
        if (loadedSettings) {
            setSettings(loadedSettings.settings);
        }
    };

    const saveLayout = async (newLayout: MosaicNode<any>) => {
        if (!newLayout) {
            return;
        }

        let x = new LayOutType(newLayout);
        await LayOutType.save(x);
    };

    const TITLE_MAP: Record<ViewId, string> = {
        tile1: 'Left Window',
        tile2: 'Top Right Window',
        tile3: 'Bottom Right Window',
    };

    const [tileCounter, setTileCounter] = useState(3);
    useEffect(() => {
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

        if (settings.length > 0) {
            fetchDataForSettings();
        }
    }, [settings]);

    const onChange = (newLayout: MosaicNode<ViewId> | null) => {
        saveLayout(newLayout).then(() => {

            setMosaicState(newLayout);
        });
    };

    const createNewTile = () => {
        const newTileId = `tile${crypto.randomUUID()}` as ViewId;
        setTileCounter(tileCounter + 1);

        const updatedLayout = {
            direction: 'row',
            first: mosaicState,
            second: newTileId,
        };

        setMosaicState(updatedLayout);
    };

    const removeTile = (tileId: ViewId) => {

        const updatedLayout = removeNode(mosaicState, tileId);
        if (updatedLayout) {
            setMosaicState(updatedLayout);
        }
    };

    const removeNode = (currentNode: MosaicNode<ViewId> | null, nodeToRemove: ViewId): MosaicNode<ViewId> | null => {
        if (!currentNode) return null;
        if (typeof currentNode === 'string' && currentNode === nodeToRemove) {
            return null; // Remove this node
        }

        if ('first' in currentNode && 'second' in currentNode) {
            const first = removeNode(currentNode.first, nodeToRemove);
            const second = removeNode(currentNode.second, nodeToRemove);
            if (!first) return second;
            if (!second) return first;
            return { ...currentNode, first, second };
        }

        return currentNode;
    };

    return (
        <div className="custom-layout-container">
            <button onClick={createNewTile}>Add New Tile</button>
            <Mosaic<ViewId>
                renderTile={(id, path) => (
                    <MosaicWindow<ViewId> path={path}
                                          createNode={() => 'tile1'}
                                          title={TITLE_MAP[id]}>
                        <h1>{TITLE_MAP[id]}</h1>
                        <button onClick={() => removeTile(id)}>Remove</button>

                    </MosaicWindow>
                )}
                resize={{ minimumPaneSizePercentage: 10 }}
                zeroStateView={<div className="zero-state">Oops</div>}
                value={mosaicState}
                onChange={onChange}
                initialValue={mosaicState} />
        </div>
    );
};

export default Home;
