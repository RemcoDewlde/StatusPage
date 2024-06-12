import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Menu } from '@headlessui/react';
import { Command } from "../../utils/command.enum.ts";

const Settings = () => {
    const [dashboardName, setDashboardName] = useState('');
    const [settings, setSettings] = useState([{ name: '', url: '' }]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await invoke(Command.GetSettings);
                const { dashboardName, settings } = response;
                setDashboardName(dashboardName);
                setSettings(settings);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        fetchSettings();
    }, []);

    const handleDashboardNameChange = (e) => {
        setDashboardName(e.target.value);
    };

    const handleSettingChange = (index: number, field: any, value: string) => {
        const newSettings = [...settings];
        newSettings[index][field] = value;
        setSettings(newSettings);
    };

    const addSetting = () => {
        setSettings([...settings, { name: '', url: '' }]);
    };

    const deleteSetting = (index: number) => {
        const newSettings = settings.filter((_, i) => i !== index);
        setSettings(newSettings);
    };

    const saveSettings = async () => {
        try {
            await invoke(Command.SaveSettings, { dashboardName, settings });
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Dashboard Name</label>
                <input
                    type="text"
                    value={dashboardName}
                    onChange={handleDashboardNameChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">URL</th>
                        <th className="py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {settings.map((setting, index) => (
                        <tr key={index} className="border-t">
                            <td className="py-2 px-4">
                                <input
                                    type="text"
                                    value={setting.name}
                                    onChange={(e) => handleSettingChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="py-2 px-4">
                                <input
                                    type="text"
                                    value={setting.url}
                                    onChange={(e) => handleSettingChange(index, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="py-2 px-4 text-right">
                                <Menu as="div" className="relative inline-block text-left">
                                    <div>
                                        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                                            Actions
                                        </Menu.Button>
                                    </div>
                                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <div className="px-1 py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => deleteSetting(index)}
                                                        className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Menu>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={addSetting}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Add Setting
            </button>
            <button
                onClick={saveSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Save Settings
            </button>
        </div>
    );
};

export default Settings;
