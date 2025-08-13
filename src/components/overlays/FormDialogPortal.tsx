import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TileForm from '@/components/TileSettingsForm';
import { useFormDialogStore } from '@/store/formDialogStore';

const FormDialogPortal = () => {
  const isOpen = useFormDialogStore(s => s.isOpen);
  const editingTileId = useFormDialogStore(s => s.editingTileId);
  const closeDialog = useFormDialogStore(s => s.closeDialog);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) closeDialog(); }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTileId ? 'Edit Tile' : 'Add New Tile'}</DialogTitle>
          <DialogDescription>
            {editingTileId ? 'Edit the details of your tile.' : 'Fill out the form to add a new tile.'}
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <TileForm onClose={closeDialog} tileId={editingTileId || undefined} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormDialogPortal;

