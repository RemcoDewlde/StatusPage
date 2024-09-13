import { TileSettings } from "@/utils/types.ts";
import { useState } from "react";


type TileSettingsFormProps = {
    onSubmit: (settings: { viewType: "summary" | "details" | "graph"; api: string }) => void;
    onCancel: () => void;
    initialSettings?: TileSettings;
};

const TileSettingsForm: React.FC<TileSettingsFormProps> = ({ onSubmit, onCancel, initialSettings }) => {
    const [api, setApi] = useState<TileSettings['api']>(initialSettings?.api || 'api1');
    const [viewType, setViewType] = useState<TileSettings['viewType']>(initialSettings?.viewType || 'summary');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ api, viewType });
    };

    return (
        <div className="modal">
        <form onSubmit={handleSubmit} className="settings-form">
        <h2>Configure Tile</h2>

    <label>
    Select API:
        <select value={api} onChange={e => setApi(e.target.value as TileSettings['api'])}>
    <option value="api1">API 1</option>
    <option value="api2">API 2</option>
    <option value="api3">API 3</option>
    {/* Add more options as needed */}
    </select>
    </label>

    <label>
    Select View Type:
        <select value={viewType} onChange={e => setViewType(e.target.value as TileSettings['viewType'])}>
    <option value="summary">Summary</option>
        <option value="details">Details</option>
        <option value="graph">Graph</option>
    {/* Add more options as needed */}
    </select>
    </label>

    <div className="form-actions">
    <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        </div>
        </form>
        </div>
);
};

export default TileSettingsForm;