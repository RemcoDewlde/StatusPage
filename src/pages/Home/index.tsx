import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
import MosaicDrawer from '@/components/mozaic/MosaicDrawer';
import { useMosaicDrawer } from '@/context/MosaicDrawerContext';
import MosaicDropOverlay from '@/components/mozaic/MosaicDropOverlay';

const AVAILABLE_VIEW_SETTINGS: Record<string, any> = {
    summary: { viewType: 'summary', api: '', configNeeded: false, additionalSettings: {} },
    details: { viewType: 'details', api: '', configNeeded: false, additionalSettings: {} },
    graph: { viewType: 'graph', api: '', configNeeded: false, additionalSettings: {} },
    dev: { viewType: 'dev', api: '', configNeeded: false, additionalSettings: {} },
    welcome: { viewType: 'welcome', api: '', configNeeded: false, additionalSettings: {} },
};

const Home = () => {
    const tileRefs = useRef<{ [id: string]: HTMLElement | null }>({});
    const { layout, tiles, titles, removeTile, setLayout, addTileAndReturnId } = useMosaic();
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

        const newDimensions: Record<string, { width: number, height: number }> = {};

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

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="relative">
                <MosaicDrawer open={drawerOpen} setOpen={setDrawerOpen} />
                <div className="custom-layout-container min-h-screen w-full bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-200">
                    <div className="relative w-full h-full min-h-screen">
                        {/* Mosaic component */}
                        <Mosaic
                            className="min-h-screen bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-inner rounded-lg border-none"
                            value={layout}
                            onChange={(newLayout: any) => {
                                setLayout(newLayout);
                                handleResize();
                            }}
                            renderTile={(id: any, path: any) => {
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
                            zeroStateView={<ZeroState createNode={(input: any) => {
                                console.log('ZeroState drop received:', input);
                                let viewType: string;
                                let label: string | undefined;
                                if (typeof input === 'object' && input !== null && input.viewType) {
                                    viewType = input.viewType;
                                    label = input.label;
                                } else {
                                    viewType = input;
                                }
                                const settings = {
                                    ...(AVAILABLE_VIEW_SETTINGS[viewType] || {
                                        viewType,
                                        api: '',
                                        additionalSettings: {},
                                    }),
                                    configNeeded: true,
                                };
                                return addTileAndReturnId(settings, label || (viewType.charAt(0).toUpperCase() + viewType.slice(1)));
                            }} />}
                            initialValue={layout}
                        />

                        {/* Only show the overlay when not in zero state and when layout exists */}
                        {layout && (
                            <MosaicDropOverlay
                                onDrop={(input: any) => {
                                    console.log('MosaicDropOverlay drop triggered with:', input);
                                    let viewType: string;
                                    let label: string | undefined;
                                    if (typeof input === 'object' && input !== null && input.viewType) {
                                        viewType = input.viewType;
                                        label = input.label;
                                    } else {
                                        viewType = input;
                                    }
                                    const settings = {
                                        ...(AVAILABLE_VIEW_SETTINGS[viewType] || {
                                            viewType,
                                            api: '',
                                            additionalSettings: {},
                                        }),
                                        configNeeded: true,
                                    };

                                    // Log before adding the tile
                                    console.log('Adding tile with:', { viewType, label, settings });

                                    // Add the tile and log the new ID
                                    const newId = addTileAndReturnId(settings, label || (viewType.charAt(0).toUpperCase() + viewType.slice(1)));
                                    console.log('New tile added with ID:', newId);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default Home;
