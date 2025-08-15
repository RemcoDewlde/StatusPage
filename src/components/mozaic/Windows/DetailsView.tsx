import { Button } from '@/components/ui/button.tsx';
import { useFormDialogStore } from '@/store/formDialogStore';
import { useMosaicStore } from '@/store/mosaicStore';

interface DetailsProps { api: string; needsConfig?: boolean; tileId?: string }

export const DetailsView = ({ api, needsConfig, tileId }: DetailsProps) => {
    const openDialog = useFormDialogStore(s => s.openDialog);
    const updateTile = useMosaicStore(s => s.updateTile);

    if (needsConfig) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-base font-semibold mb-1">Configure details tile</h3>
                    <p className="text-sm text-muted-foreground mb-3">Select an API and columns to display.</p>
                    <div className="flex items-center justify-center gap-2">
                        {tileId && <Button size="sm" onClick={() => openDialog(tileId)}>Configure now</Button>}
                        {tileId && <Button size="sm" variant="outline" onClick={() => updateTile(tileId!, { api, viewType: 'details', additionalSettings: {}, needsConfig: false })}>Skip</Button>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Details View</h1>
            <p>API: {api}</p>
        </div>
    );
};
