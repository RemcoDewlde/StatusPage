import { ApiAction, useApi } from "../../context/apiContext.tsx";
import { useEffect, useState } from "react";
import { useToast } from "../../context/toastContext.tsx";
import { PageSetting, PageSettingType } from "../../utils/types.ts";

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
            setStatusData(newStatusData);
        };

        if (settings.length > 0) {
            fetchDataForSettings();
        }
    }, [settings]);

    return (
        <div className="p-4">
            {/*<pre>*/}
            {/*    {JSON.stringify(statusData, null, 2)}*/}
            {/*</pre>*/}
            {settings.map(setting => (
                <div key={setting.pageId} className="flex items-center space-x-4 mb-4">
                    <input
                        type="text"
                        value={setting.pageId}
                        readOnly
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                        type="text"
                        value={setting.name}
                        readOnly
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                    {/*{statusData[setting.pageId] && (*/}
                    {/*    <div className="text-sm text-gray-500">*/}
                    {/*        Status: {statusData[setting.pageId].status}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            ))}
        </div>
    );
};
export default Home;