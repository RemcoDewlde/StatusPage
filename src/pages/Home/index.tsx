import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import ZeroState from '@/components/mozaic/ZeroState.tsx';
import { useMosaicStore } from '@/store/mosaicStore';
import ContentComponentFactory from '@/utils/ContentComponentFactory.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Settings2 } from 'lucide-react';
import { useFormDialogStore } from '@/store/formDialogStore';
import { useDnDStore } from '@/store/dndStore';
// @ts-ignore
import './custom-mosaic-styles.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { useEffect, useRef, useState } from 'react';

const Home = () => {
    const tileRefs = useRef<{ [id: string]: HTMLElement | null }>({});
    const layout = useMosaicStore(s => s.layout);
    const tiles = useMosaicStore(s => s.tiles);
    const titles = useMosaicStore(s => s.titles);
    const removeTile = useMosaicStore(s => s.removeTile);
    const setLayout = useMosaicStore(s => s.setLayout);
    const [tileDimensions, setTileDimensions] = useState<Record<string, { width: number; height: number }>>({});

    const openDialog = useFormDialogStore(s => s.openDialog);
    const dragging = useDnDStore(s => s.dragging);
    const hover = useDnDStore(s => s.hover);
    const setHover = useDnDStore(s => s.setHover);
    const clearHover = useDnDStore(s => s.clearHover);
    const endDrag = useDnDStore(s => s.endDrag);
    const addTileRelative = useMosaicStore(s => s.addTileRelative);

    const computeEdge = (e: React.DragEvent, el: HTMLElement): 'left' | 'right' | 'top' | 'bottom' => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;
        const distLeft = x;
        const distRight = w - x;
        const distTop = y;
        const distBottom = h - y;
        const min = Math.min(distLeft, distRight, distTop, distBottom);
        if (min === distLeft) return 'left';
        if (min === distRight) return 'right';
        if (min === distTop) return 'top';
        return 'bottom';
    };

    const buildSettingsForKind = (kind: string, needsConfig?: boolean) => ({
        viewType: kind,
        api: '',
        additionalSettings: {},
        needsConfig: !!needsConfig,
    });

    const handleDropNewTile = (targetId: string) => {
        if (!dragging) return;
        const edge = hover?.edge || 'right';
        const settings = buildSettingsForKind(dragging.tileKind, dragging.needsConfig);
        if (addTileRelative) {
            addTileRelative(targetId, edge, settings, `${dragging.tileKind} tile`);
        }
        endDrag();
    };

    const handleEditTileClick = (id: string) => {
        openDialog(id);
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

    return (
        <div className="custom-layout-container min-h-screen w-full rounded-lg bg-gray-100 dark:bg-gray-900">
            <Mosaic<string>
                className="min-h-screen rounded-lg border border-none border-gray-300 bg-white text-gray-700 shadow-inner dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                value={layout}
                onChange={newLayout => {
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
                                                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring h-8 w-8 cursor-pointer p-0 focus-visible:ring-1">
                                                <Settings2 className="h-4 w-4" />
                                                <span className="sr-only">Open settings menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 cursor-default">
                                            <DropdownMenuItem onSelect={() => handleEditTileClick(id)} className="flex cursor-pointer items-center">
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => removeTile(id)}
                                                className="text-destructive focus:text-destructive flex cursor-pointer items-center">
                                                <span>Remove</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            }>
                            <div
                                className="relative flex h-full flex-col p-4"
                                ref={node => {
                                    tileRefs.current[id] = node;
                                }}
                                onDragOver={e => {
                                    if (!dragging || !tileRefs.current[id]) return;
                                    e.preventDefault();
                                    const edge = computeEdge(e, tileRefs.current[id]!);
                                    setHover(id, edge);
                                }}
                                onDragLeave={e => {
                                    if (!dragging) return;
                                    // Only clear if leaving the element bounds entirely and this tile is the active hover target
                                    const related = e.relatedTarget as Node | null;
                                    if (related && tileRefs.current[id]?.contains(related)) return;
                                    if (hover?.targetId !== id) return;
                                    clearHover();
                                }}
                                onDrop={e => {
                                    if (!dragging) return;
                                    e.preventDefault();
                                    handleDropNewTile(id);
                                }}>
                                {dragging && hover?.targetId === id && (
                                    <div className="mosaic-dnd-overlay">
                                        <div className={`edge edge-left ${hover.edge === 'left' ? 'active' : ''}`}></div>
                                        <div className={`edge edge-right ${hover.edge === 'right' ? 'active' : ''}`}></div>
                                        <div className={`edge edge-top ${hover.edge === 'top' ? 'active' : ''}`}></div>
                                        <div className={`edge edge-bottom ${hover.edge === 'bottom' ? 'active' : ''}`}></div>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <ContentComponentFactory
                                        viewType={settings.viewType}
                                        api={settings.api}
                                        additionalSettings={settings.additionalSettings}
                                        dimensions={tileDimensions[id]}
                                        needsConfig={settings.needsConfig}
                                        tileId={id}
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
    );
};

export default Home;
