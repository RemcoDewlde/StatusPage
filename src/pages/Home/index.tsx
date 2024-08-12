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
            console.log(newStatusData);
            setStatusData(newStatusData);
        };

        if (settings.length > 0) {
            fetchDataForSettings();
        }
    }, [settings]);

    return (
        <div className="p-4">
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
                </div>
            ))}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Showcase</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {Object.values(statusData).map((pageData: any) =>
                        pageData.components.map((component: any) => (
                            <tr key={component.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{component.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{component.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{component.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(component.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(component.updated_at).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{component.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{component.showcase ? "Yes" : "No"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{component.start_date ? new Date(component.start_date).toLocaleDateString() : "N/A"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;