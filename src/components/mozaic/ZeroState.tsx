import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useMosaic } from '@/context/MosaicContext.tsx';

const ZeroState = () => {
    const { addTile } = useMosaic();

    const handleAddTile = () => {
        addTile({
            viewType: 'summary',
            api: 'test',
            additionalSettings: {},
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4">
            <PlusCircle
                className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600"
                aria-hidden="true"
            />

            <p className="text-lg mb-6 text-center">
                No Tiles Available. Click the button below to add a new tile and customize your dashboard.
            </p>

            <Button
                onClick={handleAddTile}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Add New Tile"
            >
                <PlusCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                Add New Tile
            </Button>
        </div>
    );
};

export default ZeroState;
