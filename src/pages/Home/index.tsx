import { Mosaic, MosaicWindow, MosaicNode, getNodeAtPath, updateTree } from 'react-mosaic-component';
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
import { useEffect, useRef, useState, useCallback } from 'react';
import MosaicDrawer from '@/components/mozaic/MosaicDrawer';
import MosaicDropOverlay from '@/components/mozaic/MosaicDropOverlay';
import { useMosaicStore } from '@/stores/useMosaicStore';

const AVAILABLE_VIEW_SETTINGS: Record<string, any> = {
    summary: { viewType: 'summary', api: '', configNeeded: false, additionalSettings: {} },
    details: { viewType: 'details', api: '', configNeeded: false, additionalSettings: {} },
    graph: { viewType: 'graph', api: '', configNeeded: false, additionalSettings: {} },
    dev: { viewType: 'dev', api: '', configNeeded: false, additionalSettings: {} },
    welcome: { viewType: 'welcome', api: '', configNeeded: false, additionalSettings: {} },
};

const Home = () => {
    const tileRefs = useRef<{ [id: string]: HTMLElement | null }>({});
    const mosaicContainerRef = useRef<HTMLDivElement>(null);
    const { layout, tiles, titles, removeTile, setLayout, addTileAndReturnId } = useMosaic();
    const [tileDimensions, setTileDimensions] = useState<Record<string, { width: number; height: number }>>({});
    const { drawerOpen, setDrawerOpen, setDropHandler } = useMosaicStore();

    const { openDialog } = useFormDialog();

    // Find the closest node to a position
    const findClosestNode = useCallback((position: {x: number, y: number} | null, mosaicNode: MosaicNode<string> | null) => {
        if (!mosaicContainerRef.current || !position) return { path: [], direction: 'right' };

        const containerRect = mosaicContainerRef.current.getBoundingClientRect();
        // Convert absolute position to relative within the Mosaic container
        const relX = (position.x - containerRect.left) / containerRect.width;
        const relY = (position.y - containerRect.top) / containerRect.height;

        // Function to find the closest path based on relative position
        return findClosestPath(mosaicNode, [], relX, relY);
    }, []);

    // Recursive function to find closest node
    const findClosestPath = (node: MosaicNode<string> | null, path: string[], relX: number, relY: number) => {
        if (!node) return { path, direction: 'right' as const };

        if (typeof node === 'string') {
            // Leaf node (tile)
            return {
                path,
                direction: relY < 0.5
                    ? (relX < 0.5 ? 'left' as const : 'right' as const)
                    : (relX < 0.5 ? 'bottom' as const : 'right' as const)
            };
        }

        // Split node
        const splitInfo = node.splitPercentage || 50;
        const isRowSplit = node.direction === 'row';

        if ((isRowSplit && relX < splitInfo / 100) || (!isRowSplit && relY < splitInfo / 100)) {
            // Go to first child
            return findClosestPath(node.first, [...path, 'first'], relX, relY);
        } else {
            // Go to second child
            return findClosestPath(node.second, [...path, 'second'], relX, relY);
        }
    };

    // Set up drop handler with precise positioning
    useEffect(() => {
        setDropHandler((item, position) => {
            console.log("Handling drop with position:", item, position);

            if (!item?.viewType) return;

            // Create the new node with settings from the available view types
            const settings = {
                ...(AVAILABLE_VIEW_SETTINGS[item.viewType] || {
                    viewType: item.viewType,
                    api: '',
                    additionalSettings: {},
                }),
                configNeeded: true,
            };

            // Add the tile and get its ID
            const newNodeId = addTileAndReturnId(settings, item.label || (item.viewType.charAt(0).toUpperCase() + item.viewType.slice(1)));

            if (position && layout) {
                // Find closest node and best split direction
                const { path, direction } = findClosestNode(position, layout);

                if (path.length > 0) {
                    try {
                        // Get the current node at the found path
                        const currentNode = getNodeAtPath(layout, path);

                        // Update the tree with the new node at the specified position
                        const updatedTree = updateTree(layout, [{
                            path,
                            spec: {
                                $set: {
                                    direction: direction === 'left' || direction === 'right' ? 'row' : 'column',
                                    first: direction === 'left' || direction === 'top' ? newNodeId : currentNode,
                                    second: direction === 'left' || direction === 'top' ? currentNode : newNodeId,
                                    splitPercentage: 50
                                }
                            }
                        }]);

                        console.log("Updated tree with precise positioning:", updatedTree);
                        setLayout(updatedTree);
                    } catch (e) {
                        console.error("Error updating tree:", e);
                        // Fall back to simple addition
                        setLayout({
                            direction: 'row',
                            first: layout,
                            second: newNodeId,
                            splitPercentage: 70
                        });
                    }
                } else {
                    // First node or couldn't determine position
                    setLayout(newNodeId);
                }
            } else {
                // Fall back to simple addition if no position
                if (!layout) {
                    // If empty, just set the new node
                    setLayout(newNodeId);
                } else {
                    // Otherwise add to right side of current layout
                    setLayout({
                        direction: 'row',
                        first: layout,
                        second: newNodeId,
                        splitPercentage: 70
                    });
                }
            }
        });
    }, [setDropHandler, addTileAndReturnId, layout, setLayout, findClosestNode]);

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
                <MosaicDrawer />
                <div className="custom-layout-container min-h-screen w-full bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-200">
                    <div className="relative w-full h-full min-h-screen" ref={mosaicContainerRef}>
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

                        <MosaicDropOverlay />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default Home;
