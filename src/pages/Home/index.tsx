import { ApiAction, useApi } from "../../context/apiContext.tsx";
import { useEffect, useState } from "react";
import { useToast } from "../../context/toastContext.tsx";
import { PageSetting, PageSettingType } from "@/utils/types.ts";
import './index.css';
import { Mosaic, MosaicNode, MosaicWindow } from "react-mosaic-component";

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

// Use ViewId for both layout and mosaic component
type ViewId = 'tile1' | 'tile2' | 'tile3';
type LocalMosaicState = MosaicNode<ViewId> | null;

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
    const [mosaicState, setMosaicState] = useState<LocalMosaicState>(DEFAULT_LAYOUT);

    const { addToast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            const loadedSettings = await PageSettingType.load(addToast);
            if (loadedSettings) {
                setSettings(loadedSettings.settings);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        const savedLayout = localStorage.getItem('mosaic-layout');
        if (savedLayout) {
            setMosaicState(JSON.parse(savedLayout) as LocalMosaicState);
        } else {
            setMosaicState(DEFAULT_LAYOUT);
        }
    }, []);

    const TITLE_MAP: Record<ViewId, string> = {
        tile1: 'Left Window',
        tile2: 'Top Right Window',
        tile3: 'Bottom Right Window',
    };

    useEffect(() => {
        const fetchDataForSettings = async () => {
            const newStatusData: { [key: string]: any } = {};
            for (const setting of settings) {
                try {
                    const data = await fetchStatusPageData(setting.pageId, ApiAction.Summary);
                    newStatusData[setting.pageId] = data;
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
        console.log('newLayout', newLayout);
        setMosaicState(newLayout);
    };

    return (
        <div className="custom-layout-container">
            <Mosaic<ViewId>
                renderTile={(id, path) => (
                    <MosaicWindow<ViewId> path={path} createNode={() => 'tile1'} title={TITLE_MAP[id]}>
                        <h1>{TITLE_MAP[id]}</h1>
                    </MosaicWindow>
                )}
                value={mosaicState}
                onChange={onChange}
            />
        </div>
    );
};

export default Home;
