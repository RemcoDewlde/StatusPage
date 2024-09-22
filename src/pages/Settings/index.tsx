import { useEffect, useState } from "react";
import { PageSetting, PageSettingType } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Plus, Trash2 } from "lucide-react";
import { ToastType, useToast } from "@/context/toastContext.tsx";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/tauri";
import { Command } from "@/enums/command.enum.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useRefresh } from "@/context/RefreshContext.tsx";

export default function Settings() {
    const [settings, setSettings] = useState<PageSetting[]>([]);
    const [newPageId, setNewPageId] = useState("");
    const [newName, setNewName] = useState("");
    const [version, setVersion] = useState("dev");
    const { refreshInterval, setRefreshInterval } = useRefresh();
    const { addToast } = useToast();

    const intervalOptions = [1, 2, 5, 10, 15, 30];

    useEffect(() => {
        setRefreshInterval(refreshInterval);
    }, [refreshInterval]);

    useEffect(() => {
        const fetchSettings = async () => {
            const loadedSettings = await PageSettingType.load((message: string) =>
                addToast(message, ToastType.Info, true)
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
            addToast(message, ToastType.Info, true)
        );
    };

    const updateSetting = (pageId: string, name: string) => {
        const updatedSettings = settings.map((setting) =>
            setting.pageId === pageId ? { ...setting, name } : setting
        );
        setSettings(updatedSettings);
    };

    const handleIntervalChange = async (value: string) => {
        const interval = parseInt(value);
        if (isNaN(interval)) {
            addToast("Invalid interval value.", ToastType.Warning, true);
            return;
        }
        try {
            await setRefreshInterval(interval);
            addToast(`Refresh interval set to ${interval} minutes.`, ToastType.Success, true);
        } catch (error) {
            console.error("Error setting refresh interval:", error);
            addToast("Failed to set refresh interval.", ToastType.Error, true);
        }
    };

    const addSetting = async () => {
        if (newPageId && newName) {
            const newSettingsArray = [...settings, { pageId: newPageId, name: newName }];
            const newSettings = new PageSettingType(newSettingsArray);
            setSettings(newSettingsArray);
            await saveSettings(newSettings);
            setNewPageId("");
            setNewName("");
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
                                readOnly
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
            <Card className="w-full max-w-4xl mx-auto my-4">
                <CardHeader>
                    <CardTitle>Global Update Interval</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Select
                            value={refreshInterval.toString()}
                            onValueChange={(value) => handleIntervalChange(value)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                {intervalOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option} minutes
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                            This interval applies to all status pages.
                        </span>
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
