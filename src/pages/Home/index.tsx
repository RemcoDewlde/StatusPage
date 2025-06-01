import { MosaicWindow, MosaicWithoutDragDropContext } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import ZeroState from '@/components/mozaic/ZeroState.tsx';
import { useMosaic } from '@/context/MosaicContext.tsx';
import ContentComponentFactory from '@/utils/ContentComponentFactory.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Settings2 } from 'lucide-react';
import { useFormDialog } from '@/context/FormDialogContext.tsx';
// @ts-ignore
import domtoimage from 'dom-to-image-more';
import './custom-mosaic-styles.css';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import MosaicDrawer from '@/components/mozaic/MosaicDrawer';
import { useMosaicDrawer } from '@/context/MosaicDrawerContext';

const AVAILABLE_VIEW_SETTINGS: Record<string, any> = {
    summary: { viewType: 'summary', api: '', configNeeded: false, additionalSettings: {} },
    details: { viewType: 'details', api: '', configNeeded: false, additionalSettings: {} },
    graph: { viewType: 'graph', api: '', configNeeded: false, additionalSettings: {} },
    dev: { viewType: 'dev', api: '', configNeeded: false, additionalSettings: {} },
    welcome: { viewType: 'welcome', api: '', configNeeded: false, additionalSettings: {} },
};

const Home = () => {
    const tileRefs = useRef<{ [id: string]: HTMLElement | null }>({});
    const { layout, tiles, titles, removeTile, setLayout, addTile } = useMosaic();
    const [tileDimensions, setTileDimensions] = useState<Record<string, { width: number; height: number }>>({});
    const { drawerOpen, setDrawerOpen } = useMosaicDrawer();

    const { openDialog } = useFormDialog();

    const handleEditTileClick = (id: string) => {
        requestAnimationFrame(() => {
            // Needs to be wrapped in requestAnimationFrame to ensure the DOM is updated before opening the dialog
            // Otherwise the dialog will cause the autoFocus to not work correctly and block the view
            openDialog(id);
        });
    };

    const handleResize = () => {
        if (!tileRefs.current) return;

        const newDimensions: Record<string, { width: number; height: number }> = {};

        Object.entries(tileRefs.current).forEach(([id, node]) => {
            if (node) {
                const { clientWidth, clientHeight } = node;
                newDimensions[id] = { width: clientWidth, height: clientHeight };
            }
        });

        setTileDimensions(newDimensions);
    };

    useEffect(() => {
        handleResize();
    }, [layout]);

    // Drop target for adding new tiles
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'MOSAIC_VIEW',
        drop: (item: { viewType: string }) => {
            // Always set configNeeded to true when dragging a tile onto the layout
            // This allows the user to configure the tile immediately after adding it
            const settings = {
                ...(AVAILABLE_VIEW_SETTINGS[item.viewType] || {
                    viewType: item.viewType,
                    api: '',
                    additionalSettings: {},
                }),
                configNeeded: true,
            };
            addTile(settings, settings.viewType.charAt(0).toUpperCase() + settings.viewType.slice(1));
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <div className="relative">
            <MosaicDrawer open={drawerOpen} setOpen={setDrawerOpen} />
            <div
                ref={drop}
                className={`custom-layout-container min-h-screen w-full bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-200
                    ${isOver && canDrop ? 'border-4 border-blue-500 bg-blue-100/60' : 'border-transparent'}`}
                style={isOver && canDrop ? { boxShadow: '0 0 0 4px #3b82f6, 0 0 40px 8px #60a5fa55' } : {}}
            >
                <MosaicWithoutDragDropContext<string>
                    className="min-h-screen bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-inner rounded-lg border-none"
                    value={layout}
                    onChange={(newLayout) => {
                        setLayout(newLayout);
                        handleResize();
                    }}
                    renderTile={(id, path) => {
                        const settings = tiles[id];
                        const title = titles[id];
                        return (
                            <MosaicWindow<string>
                                path={path}
                                title={title || 'Untitled'}
                                toolbarControls={
                                    <div className="mosaic-window-controls flex items-center space-x-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                                >
                                                    <Settings2 className="h-4 w-4" />
                                                    <span className="sr-only">Open settings menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 cursor-default">
                                                <DropdownMenuItem
                                                    onSelect={() => handleEditTileClick(id)}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => removeTile(id)}
                                                    className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                                                >
                                                    <span>Remove</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                }
                            >
                                <div className="p-4 flex flex-col h-full"
                                     ref={(node) => {
                                         tileRefs.current[id] = node;
                                     }}>
                                    <div className="flex-1">
                                        <ContentComponentFactory
                                            viewType={settings.viewType}
                                            api={settings.api}
                                            additionalSettings={settings.additionalSettings}
                                            dimensions={tileDimensions[id]}
                                        />
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
        </div>
    );
};

export default Home;
