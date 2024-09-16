import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { ViewId } from '@/utils/types';
import ZeroState from '@/components/mozaic/ZeroState.tsx';
import { useMosaic } from '@/context/MosaicContext.tsx';
import ContentComponentFactory from '@/utils/ContentComponentFactory.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormDialog } from '@/context/FormDialogContext.tsx';

const Home = () => {
    const { layout, tiles, titles, removeTile, setLayout } = useMosaic();
    const { openDialog } = useFormDialog();


    const handleEditTileClick = (id: ViewId) => {
        openDialog(id);
    };

    return (
        <div className="custom-layout-container min-h-screen w-full bg-gray-100 dark:bg-gray-900">
            <Mosaic<ViewId>
                className="min-h-screen bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-inner rounded-lg"
                value={layout}
                onChange={(newLayout) => setLayout(newLayout)}
                renderTile={(id, path) => {
                    const settings = tiles[id];
                    const title = titles[id];
                    return (
                        <MosaicWindow<ViewId> path={path} title={title || 'Untitled'}>
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex-1">
                                    <ContentComponentFactory viewType={settings.viewType} api={settings.api} />
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    <Button variant="destructive" onClick={() => removeTile(id)}>
                                        Remove
                                    </Button>
                                    <Button onClick={() => handleEditTileClick(id)}>Edit</Button>
                                </div>
                            </div>
                        </MosaicWindow>
                    );
                }}
                resize={{ minimumPaneSizePercentage: 10 }}
                zeroStateView={<ZeroState />}
                initialValue={layout}
            />
        </div>
    );
};

export default Home;
