import { useDrop } from 'react-dnd';
import { useCallback, useState } from 'react';
import { useMosaicStore } from '@/stores/useMosaicStore';

export default function MosaicDropOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const {
        drawerOpen,
        isDragging,
        handleDrop,
        setDropPosition,
    } = useMosaicStore();

    // Track mouse position during drag
    const handleMouseMove = useCallback((e: any) => {
        if (isDragging) {
            setDropPosition({ x: e.clientX, y: e.clientY });
        }
    }, [isDragging, setDropPosition]);

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'MOSAIC_VIEW',
        drop: (item, monitor) => {
            console.log('DROP DETECTED:', item);

            if (monitor.didDrop()) {
                console.log('Drop already handled by child');
                return;
            }

            // Get the client offset (mouse position relative to viewport)
            const clientOffset = monitor.getClientOffset();

            console.log('Processing drop, calling handleDrop with:', item, clientOffset);
            handleDrop(item, clientOffset ? { x: clientOffset.x, y: clientOffset.y } : null);
            return { dropped: true };
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    });

    const isActive = isOver && canDrop;

    if (drawerOpen) {
        return null;
    }

    // console.log('Drop overlay state:', { isOver, canDrop, isActive, isVisible, dragInProgress: isDragging });

    return (
        <div
            ref={drop}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: isActive ? 1000 : isDragging ? 100 : 10,
                pointerEvents: isVisible && !drawerOpen ? 'all' : 'none',
                background: isActive
                    ? 'rgba(59,130,246,0.3)'
                    : isDragging
                        ? 'rgba(0,0,0,0.05)'
                        : 'rgba(0,0,0,0.01)',
                border: isActive
                    ? '4px solid blue'
                    : isDragging
                        ? '2px dashed rgba(0,0,0,0.2)'
                        : '1px dashed rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                cursor: canDrop ? 'copy' : 'default',
                opacity: isDragging ? 1 : 0,
            }}
            data-testid="mosaic-drop-overlay"
            onDragOver={(e) => {
                e.preventDefault();
            }}
            onMouseMove={handleMouseMove}
        />
    );
}
