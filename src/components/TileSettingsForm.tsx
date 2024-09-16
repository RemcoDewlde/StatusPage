import React, { useState } from 'react';
import { useMosaic } from '@/context/MosaicContext';
import { ViewId } from '@/utils/types';
import { Button } from '@/components/ui/button.tsx';

interface TileFormProps {
    onClose: () => void;
    tileId?: ViewId;
}

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tileId) {
            updateTile(tileId, formData);
        } else {
            addTile(formData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>View Type</label>
                <input
                    type="text"
                    value={formData.viewType}
                    onChange={(e) => setFormData({ ...formData, viewType: e.target.value })}
                />
            </div>
            <div>
                <label>API</label>
                <input
                    type="text"
                    value={formData.api}
                    onChange={(e) => setFormData({ ...formData, api: e.target.value })}
                />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">{tileId ? 'Update' : 'Add'}</Button>
            </div>
        </form>
    );
};

export default TileForm;
