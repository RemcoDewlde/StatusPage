import React, { useEffect, useState } from 'react';
import { useMosaic } from '@/context/MosaicContext';
import { ViewId } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';

interface TileFormProps {
    onClose: () => void;
    tileId?: ViewId;
}

const fetchApiOptions = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return ['API 1', 'API 2', 'API 3', 'API 4'];
};

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

    const [apiOptions, setApiOptions] = useState<string[]>([]);

    useEffect(() => {
        fetchApiOptions().then(setApiOptions);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tileId) {
            updateTile(tileId, formData);
        } else {
            addTile(formData);
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
            case 'summary':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Map Center Coordinates</label>
                        <Input
                            type="text"
                            value={formData.additionalSettings.mapCenter || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                additionalSettings: {
                                    ...formData.additionalSettings,
                                    mapCenter: e.target.value,
                                },
                            })}
                            placeholder="Enter latitude,longitude"
                        />
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
                                <SelectItem key={api} value={api}>
                                    {api}
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
                            {viewTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {renderAdditionalFields()}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">{tileId ? 'Update' : 'Add'}</Button>
            </CardFooter>
        </form>
    );
};

export default TileForm;
