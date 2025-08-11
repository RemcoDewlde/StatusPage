import { useDrop } from 'react-dnd';
import { useEffect, useState } from 'react';
import { useMosaicDrawer } from '@/context/MosaicDrawerContext';

export default function MosaicDropOverlay({ onDrop }: { onDrop: (item: any) => void }) {
  // Track drops and visibility
  const [isVisible, setIsVisible] = useState(false);
  const [dropDetected, setDropDetected] = useState(false);
  // Get drawer state to prevent overlay from covering drawer
  const { drawerOpen } = useMosaicDrawer();

  // Make overlay visible after a slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      console.log('MosaicDropOverlay is now visible and ready for drops');
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'MOSAIC_VIEW',
    drop: (item, monitor) => {
      console.log('DROP DETECTED:', item);
      setDropDetected(true);

      if (monitor.didDrop()) {
        console.log('Drop already handled by child');
        return;
      }

      console.log('Processing drop, calling onDrop with:', item);
      onDrop(item);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  // Only show overlay when drawer is closed
  if (drawerOpen) {
    return null;
  }

  return (
    <div
      ref={drop}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Simple z-index approach: high only when actively hovering over during drag
        zIndex: isActive ? 1000 : 10,
        pointerEvents: isVisible && !drawerOpen ? 'all' : 'none',
        background: isActive
          ? 'rgba(59,130,246,0.3)'
          : 'rgba(0,0,0,0.01)',
        border: isActive
          ? '4px solid blue'
          : '1px dashed rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        cursor: canDrop ? 'copy' : 'default',
      }}
      data-testid="mosaic-drop-overlay"
      onDragOver={(e) => {
        e.preventDefault(); // Required for HTML5 drop
      }}
    >
    </div>
  );
}
