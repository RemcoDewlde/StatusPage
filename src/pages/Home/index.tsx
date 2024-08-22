import { ApiAction, useApi } from "../../context/apiContext.tsx";
import { useEffect, useState } from "react";
import { useToast } from "../../context/toastContext.tsx";
import { PageSetting, PageSettingType } from "@/utils/types.ts";
import {Layout, Model} from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import './index.css';

let json = {
    global: {
        realtimeResize: true,
        tabSetEnableSingleTabStretch: true,
        tabSetMinWidth: 100,
        tabSetMinHeight: 100,
        tabSetMarginInsets: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        }
    },
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                enableDrop: true,
                enableDrag: false,
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "button",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 20,
                children: [
                    {
                        type: "tab",
                        name: "bla",
                        component: "button",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "button",
                    }
                ]
            }
        ]
    }
};

const Home = () => {
    const { fetchStatusPageData } = useApi();
    const [settings, setSettings] = useState<PageSetting[]>([]);
    const [statusData, setStatusData] = useState<{ [key: string]: any }>({});
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
        const fetchDataForSettings = async () => {
            const newStatusData: { [key: string]: any } = {};
            for (const setting of settings) {
                try {
                    console.log(`Fetching summary for ${setting.pageId}`);
                    const data = await fetchStatusPageData(setting.pageId, ApiAction.Summary);
                    newStatusData[setting.pageId] = data;
                } catch (error) {
                    console.error(`Error fetching summary for ${setting.pageId}:`, error);
                }
            }
            console.log(newStatusData);
            setStatusData(newStatusData);
        };

        if (settings.length > 0) {
            fetchDataForSettings();
        }
    }, [settings]);

    const factory = (node: any) => {
        let component = node.getComponent();

        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
    }
    const model = Model.fromJson(json);

    return (
        <div className="custom-layout-container">
            <Layout
                model={model}
                factory={factory} />
        </div>
    );
};

export default Home;