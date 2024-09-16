import { useEffect, useState } from 'react';
import { PageSetting, PageSettingType } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Plus, Trash2 } from 'lucide-react';
import { ToastType, useToast } from '@/context/toastContext.tsx';
import { Input } from '@/components/ui/input';
import { invoke } from '@tauri-apps/api/tauri';
import { Command } from '@/enums/command.enum.ts';

export default function Settings() {
    const [settings, setSettings] = useState<PageSetting[]>([]);
    const [newPageId, setNewPageId] = useState('');
    const [newName, setNewName] = useState('');
    const [version, setVersion] = useState('dev');
    const { addToast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            const loadedSettings = await PageSettingType.load((message: string) =>
                addToast(message, ToastType.Info, true),
            );
            if (loadedSettings) {
                setSettings(loadedSettings.settings);
            }
        };

        fetchSettings();
    }, [addToast]);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                let appVersion: string = await invoke(Command.GetApplicationVersion.toString());
                setVersion(appVersion.toString());
            } catch (error) {
            }
        };
        fetchVersion();
    }, []);

    const saveSettings = async (newSettings: PageSettingType) => {
        await PageSettingType.save(newSettings, (message: string) =>
            addToast(message, ToastType.Info, true),
        );
    };

    const updateSetting = (pageId: string, name: string) => {
        const updatedSettings = settings.map((setting) =>
            setting.pageId === pageId ? { ...setting, name } : setting,
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
        const filteredSettings = settings.filter((setting) => setting.pageId !== pageId);
        const newSettings = new PageSettingType(filteredSettings);
        setSettings(filteredSettings);
        await saveSettings(newSettings);
    };

    return (
        <div>
            <Card className="w-full max-w-4xl mx-auto my-4">
                <CardHeader>
                    <CardTitle>Saved StatusPages</CardTitle>
                </CardHeader>
                <CardContent>
                    {settings.map((setting) => (
                        <div key={setting.pageId} className="flex items-center space-x-4 mb-4">
                            <Input
                                type="text"
                                value={setting.pageId}
                                readOnly
                                className="w-1/3"
                            />
                            <Input
                                type="text"
                                value={setting.name}
                                onChange={(e) => updateSetting(setting.pageId, e.target.value)}
                                className="w-1/3"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removeSetting(setting.pageId)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <div className="flex items-center space-x-4 mt-6">
                        <Input
                            type="text"
                            placeholder="Page ID"
                            value={newPageId}
                            onChange={(e) => setNewPageId(e.target.value)}
                            className="w-1/3"
                        />
                        <Input
                            type="text"
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-1/3"
                        />
                        <Button onClick={addSetting}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Setting
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="max-w-4xl mx-auto bottom-2">
                <CardContent className="flex flex-col items-center justify-center text-sm text-muted-foreground py-4">
                    <div className="flex items-center">
                        <a href="https://github.com/RemcoDewlde/StatusPage " target="_blank" rel="noreferrer"
                           className="flex items-center hover:text-primary">
                            <Github className="h-4 w-4 mr-1" />
                            View on GitHub
                        </a>
                        <span className="mx-2">|</span>
                        <span>Version {version}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
