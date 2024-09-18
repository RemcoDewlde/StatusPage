import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { ViewId } from '@/utils/types';
import ZeroState from '@/components/mozaic/ZeroState.tsx';
import { useMosaic } from '@/context/MosaicContext.tsx';
import ContentComponentFactory from '@/utils/ContentComponentFactory.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormDialog } from '@/context/FormDialogContext.tsx';

import './custom-mosaic-styles.css';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';


const Home = () => {
    const { layout, tiles, titles, removeTile, setLayout } = useMosaic();
    const { openDialog } = useFormDialog();
    // const context = useContext(MosaicWindowContext);
    // const [toggleAdditionalControls, setToggleAdditionalControls] = useState(false);

    const handleEditTileClick = (id: ViewId) => {
        openDialog(id);
    };

    // const handleTogle = () => {
    //     setToggleAdditionalControls(!toggleAdditionalControls);
    // };

    const additionalControls = (
        <div className="p-4 space-y-4">
            <p className="text-gray-700">Additional Settings:</p>
            <Button onClick={() => alert('Action 1')}>Action 1</Button>
            <Button onClick={() => alert('Action 2')}>Action 2</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">More Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => alert('Option 1')}>Option 1</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => alert('Option 2')}>Option 2</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {/*<Button variant="destructive" onClick={toggleAdditionalControls}>*/}
            {/*    /!*TODO: fix this*!/*/}
            {/*    Close*/}
            {/*</Button>*/}
        </div>
    );

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
                        <MosaicWindow<ViewId>
                            path={path}
                            title={title || 'Untitled'}
                            toolbarControls={
                                <div className="mosaic-window-controls flex items-center space-x-2">
                                    {/*<Button size="sm" onClick={handleTogle()}>*/}
                                    {/*    Options*/}
                                    {/*</Button>*/}
                                </div>
                            }
                            additionalControls={additionalControls}
                        >
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
