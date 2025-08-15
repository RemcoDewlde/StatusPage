import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettingsDialogStore } from '@/store/settingsDialogStore';
import Settings from '@/pages/Settings';

const SettingsDialogPortal = () => {
  const isOpen = useSettingsDialogStore(s => s.isOpen);
  const close = useSettingsDialogStore(s => s.close);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6 h-[calc(90vh-4rem)] overflow-y-auto">
          <Settings />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialogPortal;

