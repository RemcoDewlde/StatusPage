import React, { useEffect, useState } from 'react';
import { useMosaic } from '@/context/MosaicContext';
import { DevSettingsType, PageSettingType } from "@/utils/types";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';

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

const viewTypes = ['details', 'graph', 'summary'];

const TileForm: React.FC<TileFormProps> = ({ onClose, tileId }) => {
    const { tiles, addTile, updateTile } = useMosaic();
    const initialSettings = tileId ? tiles[tileId] : {
        viewType: '',
        api: '',
        additionalSettings: {},
    };

    const [formData, setFormData] = useState({
        viewType: initialSettings.viewType || '',
        api: initialSettings.api || '',
        additionalSettings: initialSettings.additionalSettings || {},
    });

    const [apiOptions, setApiOptions] = useState<{ pageId: string; name: string }[]>([]);
    const [viewTypeSettings, setViewTypeSetView] = useState<string[]>(viewTypes);

    useEffect(() => {
        fetchApiOptions().then(setApiOptions);
        fetchDevSettings().then((devMode) => {
            if (devMode) {
                setViewTypeSetView([...viewTypes, 'dev']);
            }
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tileId) {
            updateTile(tileId, formData);
        } else {
            let apiName = apiOptions.find(option => option.pageId === formData.api);
            let title = `${apiName?.name} - ${formData.viewType}`
            if (formData.additionalSettings.chartType) {
                title += ` - ${formData.additionalSettings.chartType}`;
            }
            addTile(formData, title);
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
                                <SelectItem value="line">Line Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                            </SelectContent>
                        </Select>
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
                                <SelectItem key={api.pageId} value={api.pageId}>
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
                                <SelectItem key={type} value={type}>
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
