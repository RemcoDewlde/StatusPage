import { useState, useEffect, useRef } from 'react';
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

// @ts-ignore
const DraggableItem = ({ view, setOpen }) => {
    // State to track drag status
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef(null);

    // Manual mouse event handling to ensure drag works with the drawer
    const [isMouseDown, setIsMouseDown] = useState(false);

    // Use standard react-dnd with simplified approach
    const [{ opacity }, dragRef] = useDrag({
        type: 'MOSAIC_VIEW',
        item: () => {
            console.log('Drag starting for', view.label);
            setOpen(false); // Close drawer when drag starts
            setIsDragging(true);
            return { viewType: view.type, label: view.label };
        },
        end: () => {
            console.log('Drag ended for', view.label);
            setIsDragging(false);
            setOpen(false);
        },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
    });

    // Helper to handle mouse interactions directly
    const handleMouseDown = (e) => {
        console.log('Mouse down on', view.label);
        setIsMouseDown(true);
    };

    // Handle click as an alternative to drag
    const handleClick = (e) => {
        console.log('Clicked on', view.label);
        // Create a new tile directly if drag doesn't work
        if (!isDragging) {
            setOpen(false);
            // You can optionally trigger the creation directly here
            // by passing a callback through props
        }
    };

    // Connect the drag ref
    const combinedRef = (node) => {
        itemRef.current = node;
        dragRef(node);
    };

    return (
        <div
            ref={combinedRef}
            style={{
                opacity: opacity,
                cursor: isMouseDown ? 'grabbing' : 'grab',
                minWidth: 140,
                minHeight: 60,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                touchAction: 'none',
                backgroundColor: 'white',
                boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.2s, transform 0.1s',
                transform: isMouseDown ? 'scale(0.98)' : 'scale(1)',
                position: 'relative',
                zIndex: 10,
            }}
            className="p-4 border rounded hover:bg-gray-100 select-none shadow-md flex flex-col items-center justify-center"
            role="button"
            tabIndex={0}
            aria-label={`Drag to add ${view.label}`}
            onMouseDown={handleMouseDown}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
            onClick={handleClick}
        >
            <span className="text-lg font-semibold mb-1">{view.label}</span>
            <span className="text-xs text-gray-500">Drag to add</span>
            {isDragging && <span className="sr-only">Currently dragging</span>}
        </div>
    );
};

export default function MosaicDrawer({ open, setOpen }: {
    onDragStart?: (viewType: string) => void,
    open: boolean,
    setOpen: (open: boolean) => void
}) {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(AVAILABLE_VIEWS.length / PAGE_SIZE);
    const pagedViews = AVAILABLE_VIEWS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Add debug log to verify component mounting
    useEffect(() => {
        console.log('MosaicDrawer mounted, open:', open);
    }, []);

    return (
        <Drawer open={open} onOpenChange={setOpen} autoFocus={open}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Available Views</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-2 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pagedViews.map((view) => (
                            <DraggableItem
                                key={view.type}
                                view={view}
                                setOpen={setOpen}
                            />
                        ))}
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
