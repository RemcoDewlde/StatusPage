import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/toastContext.tsx';
import { PageSetting, PageSettingType } from '../../utils/types.ts';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


const Settings: React.FC = () => {
    const [settings, setSettings] = useState<PageSetting[]>([]);
    const [newPageId, setNewPageId] = useState('');
    const [newName, setNewName] = useState('');
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

    const saveSettings = async (newSettings: PageSettingType) => {
        await PageSettingType.save(newSettings, addToast);
    };

    const updateSetting = (pageId: string, name: string) => {
        const updatedSettings = settings.map(setting =>
            setting.pageId === pageId ? { ...setting, name } : setting
        );
        setSettings(updatedSettings);
    };

    const addSetting = async () => {
        if (newPageId && newName) {
            const newSettingsArray = [...settings, { pageId: newPageId, name: newName }];
            const newSettings = new PageSettingType(newSettingsArray);
            setSettings(newSettingsArray);
            await saveSettings(newSettings);
            setNewPageId('');
            setNewName('');
        }
    };

    const removeSetting = async (pageId: string) => {
        const filteredSettings = settings.filter(setting => setting.pageId !== pageId);
        const newSettings = new PageSettingType(filteredSettings);
        setSettings(filteredSettings);
        await saveSettings(newSettings);
    };

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
                        onChange={(e) => updateSetting(setting.pageId, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                        onClick={() => removeSetting(setting.pageId)}
                        className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                    >
                        Remove
                    </button>
                </div>
            ))}
            <div className="flex items-center space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Page ID"
                    value={newPageId}
                    onChange={(e) => setNewPageId(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                />
                <button
                    onClick={addSetting}
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                >
                    Add Setting
                </button>
            </div>

            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>



        </div>
    );
};

export default Settings;
