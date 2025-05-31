import React, { useEffect, useState } from 'react';
import { useMosaic } from '@/context/MosaicContext';
import { DevSettingsType, PageSettingType } from "@/utils/types";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Switch } from "@/components/ui/switch.tsx";
import { ApiAction, useApi } from "@/context/apiContext.tsx";

interface TileFormProps {
    onClose: () => void;
    tileId?: string;
}

const fetchApiOptions = async () => {
    const loadedSettings = await PageSettingType.load();
    return loadedSettings ? loadedSettings.settings : [];
};

const fetchDevSettings = async () => {
    const loadedDevSettings = await DevSettingsType.load();
    return loadedDevSettings ? loadedDevSettings.devMode : false;
}

// TODO: Implement 'details' is not included in the viewTypes array because it is not a valid view type at this point
const viewTypes = ['graph', 'summary'];

const TileForm: React.FC<TileFormProps> = ({ onClose, tileId }) => {

    const { fetchStatusPageData } = useApi();
    // New state variables
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
    const [hasGroups, setHasGroups] = useState<boolean>(false);

    const { tiles, titles, addTile, updateTile } = useMosaic();
    const initialSettings = tileId ? tiles[tileId] : {
        viewType: '',
        api: '',
        additionalSettings: {},
    };

    const initialTitle = tileId && titles[tileId] ? titles[tileId] : '';
    const [formData, setFormData] = useState({
        viewType: initialSettings.viewType || '',
        api: initialSettings.api || '',
        additionalSettings: initialSettings.additionalSettings || {},
        title: initialTitle,
    });
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);

    const [apiOptions, setApiOptions] = useState<{ pageId: string; name: string }[]>([]);
    const [viewTypeSettings, setViewTypeSetView] = useState<string[]>(viewTypes);

    useEffect(() => {
        fetchApiOptions().then(setApiOptions);
        fetchDevSettings().then((devMode) => {
            if (devMode) {
                setViewTypeSetView([...viewTypes, 'dev', 'welcome']);
            }
        });
    }, []);

    // Auto-generate title when API or viewType changes, unless manually edited
    useEffect(() => {
        if (!titleManuallyEdited) {
            let apiName = apiOptions.find(option => option.pageId === formData.api)?.name || '';
            let newTitle = apiName && formData.viewType ? `${apiName} - ${formData.viewType}` : '';
            if (formData.additionalSettings.chartType) {
                newTitle += ` - ${formData.additionalSettings.chartType}`;
            }
            setFormData(prev => ({ ...prev, title: newTitle }));
        }
    }, [formData.api, formData.viewType, formData.additionalSettings.chartType, apiOptions, titleManuallyEdited]);

    useEffect(() => {
        const fetchGroups = async () => {
            if (formData.api) {
                try {
                    // Fetch data from the selected API
                    const data = await fetchStatusPageData(formData.api, ApiAction.Components);

                    // Process data to extract groups
                    const components = data.components;

                    // Create a map of group ids to group names
                    const groupMap = new Map<string, string>();

                    components.forEach((component) => {
                        if (component.group && component.id && component.name) {
                            // This component is a group
                            groupMap.set(component.id, component.name);
                        }
                    });

                    // Now create the groupList
                    const groupList = Array.from(groupMap.entries()).map(([id, name]) => ({ id, name }));

                    setGroups(groupList);
                    setHasGroups(groupList.length > 0);
                } catch (error) {
                    console.error('Error fetching groups:', error);
                }
            } else {
                // If no API is selected, reset the groups
                setGroups([]);
                setHasGroups(false);
            }
        };

        fetchGroups();
    }, [formData.api, fetchStatusPageData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { title, ...tileSettings } = formData;
        if (tileId) {
            updateTile(tileId, tileSettings, title);
        } else {
            addTile(tileSettings, title);
        }
        onClose();
    };

    const renderAdditionalFields = () => {
        switch (formData.viewType) {
            case 'details':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Table Columns</label>
                        <Input
                            type="text"
                            value={formData.additionalSettings.tableColumns || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                additionalSettings: {
                                    ...formData.additionalSettings,
                                    tableColumns: e.target.value,
                                },
                            })}
                            placeholder="Enter column names separated by commas"
                        />
                    </div>
                );
            case 'graph':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Chart Type</label>
                        <Select
                            value={formData.additionalSettings.chartType || ''}
                            onValueChange={(value) => setFormData({
                                ...formData,
                                additionalSettings: {
                                    ...formData.additionalSettings,
                                    chartType: value,
                                },
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                {/*<SelectItem value="line">Line Chart</SelectItem>*/}
                                <SelectItem value="pie">Pie Chart</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            case 'summary':
                return (
                    <div className="space-y-4">
                        {/* Only show if the API data has groups */}
                        {hasGroups && (
                            <>
                                <label className="block text-sm font-medium text-gray-700">Show only one group?</label>
                                <Switch
                                    disabled={false}
                                    checked={formData.additionalSettings.showOneGroup || false}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            additionalSettings: {
                                                ...formData.additionalSettings,
                                                showOneGroup: checked,
                                            },
                                        })
                                    }
                                />
                            </>
                        )}

                        {/* Show group selection if 'Show only one group' is checked */}
                        {formData.additionalSettings.showOneGroup && hasGroups && (
                            <>
                                <label className="block text-sm font-medium text-gray-700">Group</label>
                                <Select
                                    value={formData.additionalSettings.groupId || ''}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            additionalSettings: {
                                                ...formData.additionalSettings,
                                                groupId: value,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    </div>
                    );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <Input
                        type="text"
                        value={formData.title}
                        onChange={e => {
                            setFormData({ ...formData, title: e.target.value });
                            setTitleManuallyEdited(true);
                        }}
                        placeholder="Enter tile title"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">API</label>
                    <Select
                        value={formData.api}
                        onValueChange={(value) => setFormData({ ...formData, api: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select API" />
                        </SelectTrigger>
                        <SelectContent>
                            {apiOptions.map((api) => (
                                <SelectItem key={api.pageId} value={api.pageId} className="cursor-pointer">
                                    {api.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">View Type</label>
                    <Select
                        value={formData.viewType}
                        onValueChange={(value) => setFormData({ ...formData, viewType: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select view type" />
                        </SelectTrigger>
                        <SelectContent>
                            {viewTypeSettings.map((type) => (
                                <SelectItem key={type} value={type} className="cursor-pointer">
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {renderAdditionalFields()}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">{tileId ? 'Update' : 'Add'}</Button>
            </CardFooter>
        </form>
    );
};

export default TileForm;
