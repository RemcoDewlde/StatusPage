import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useFormDialogStore } from '@/store/formDialogStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';
import { useDnDStore } from '@/store/dndStore';
import { useMosaicStore } from '@/store/mosaicStore';
import { useState } from 'react';

const ZeroState = () => {
    const openDialog = useFormDialogStore(s => s.openDialog);
    const dragging = useDnDStore(s => s.dragging);
    const endDrag = useDnDStore(s => s.endDrag);
    const addTile = useMosaicStore(s => s.addTile);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleAddTile = () => {
        openDialog();
    };

    const buildSettingsForKind = (kind: string, needsConfig?: boolean) => ({
        viewType: kind,
        api: '',
        additionalSettings: {},
        needsConfig: !!needsConfig,
    });

    const handleDragOver = (e: React.DragEvent) => {
        if (!dragging) return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!dragging) return;
        // Only clear if fully leaving container
        const related = e.relatedTarget as Node | null;
        if (related && (e.currentTarget as HTMLElement).contains(related)) return;
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!dragging) return;
        e.preventDefault();
        const settings = buildSettingsForKind(dragging.tileKind, dragging.needsConfig);
        addTile(settings, `${dragging.tileKind} tile`);
        setIsDragOver(false);
        endDrag();
    };

    return (
        <div
            className={`flex items-center justify-center min-h-screen bg-background transition-colors duration-150 ${isDragOver ? 'ring-4 ring-blue-400/60 ring-offset-4 ring-offset-background' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Card className="w-full max-w-md mx-4">
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-2 px-4 text-center">
                    <PlusCircle className="w-12 h-12 mb-4 text-muted-foreground" aria-hidden="true" />
                    <h2 className="text-lg font-semibold mb-2">No Tiles Available</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        {dragging ? 'Release to create a new tile here.' : 'Click the button or drag a tile type here to get started.'}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <Button onClick={handleAddTile} className="w-full max-w-xs">
                        <PlusCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add New Tile
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ZeroState;
