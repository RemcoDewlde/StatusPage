import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useDrag } from 'react-dnd';

// TODO: Pressing the next button doesnt work....
const AVAILABLE_VIEWS = [
    { type: 'summary', label: 'Summary' },
    { type: 'details', label: 'Details' },
    { type: 'graph', label: 'Graph' },
    { type: 'dev', label: 'Dev' },
    { type: 'welcome', label: 'Welcome' },
];

const PAGE_SIZE = 6;

export default function MosaicDrawer({ open, setOpen }: {
    onDragStart?: (viewType: string) => void,
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(AVAILABLE_VIEWS.length / PAGE_SIZE);
    const pagedViews = AVAILABLE_VIEWS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <Drawer open={open} onOpenChange={setOpen} autoFocus={open}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Available Views</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-2 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pagedViews.map((view) => {
                            const [{ isDragging }, drag] = useDrag(() => ({
                                type: 'MOSAIC_VIEW',
                                item: () => {
                                    setOpen(false);
                                    return { viewType: view.type, label: view.label };
                                },
                                collect: (monitor) => ({
                                    isDragging: monitor.isDragging(),
                                }),
                            }));
                            return (
                                <div
                                    key={view.type}
                                    ref={drag}
                                    style={{
                                        opacity: isDragging ? 0.5 : 1,
                                        cursor: isDragging ? 'grabbing' : 'grab',
                                        minWidth: 140,
                                        minHeight: 60,
                                    }}
                                    className="p-4 border rounded bg-white hover:bg-gray-100 select-none shadow-md flex flex-col items-center justify-center"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Drag to add ${view.label}`}
                                >
                                    <span className="text-lg font-semibold mb-1">{view.label}</span>
                                    <span className="text-xs text-gray-500">Drag to add</span>
                                </div>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
                            <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

