import { createContext, ReactNode, useContext, useState } from 'react';
import { ViewId } from '@/utils/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TileForm from '@/components/TileSettingsForm.tsx';


interface FormDialogContextProps {
    openDialog: (tileId?: ViewId) => void;
    closeDialog: () => void;
}

const FormDialogContext = createContext<FormDialogContextProps | undefined>(undefined);

export const FormDialogProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingTileId, setEditingTileId] = useState<ViewId | null>(null);

    const openDialog = (tileId?: ViewId) => {
        setEditingTileId(tileId || null);
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
        setEditingTileId(null);
    };

    return (
        <FormDialogContext.Provider value={{ openDialog, closeDialog }}>
            {children}
            <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTileId ? 'Edit Tile' : 'Add New Tile'}</DialogTitle>
                        <DialogDescription>
                            {editingTileId ? 'Edit the details of your tile.' : 'Fill out the form to add a new tile.'}
                        </DialogDescription>
                    </DialogHeader>
                    <TileForm onClose={closeDialog} tileId={editingTileId || undefined} />
                </DialogContent>
            </Dialog>
        </FormDialogContext.Provider>
    );
};

export const useFormDialog = () => {
    const context = useContext(FormDialogContext);
    if (!context) {
        throw new Error('useFormDialog must be used within a FormDialogProvider');
    }
    return context;
};