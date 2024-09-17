import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useFormDialog } from '@/context/FormDialogContext.tsx';
import { Card, CardContent, CardFooter } from '@/components/ui/card.tsx';

const ZeroState = () => {
    const { openDialog } = useFormDialog();

    const handleAddTile = () => {
        openDialog();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md mx-4">
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-2 px-4 text-center">
                    <PlusCircle className="w-12 h-12 mb-4 text-muted-foreground" aria-hidden="true" />
                    <h2 className="text-lg font-semibold mb-2">No Tiles Available</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Click the button below to add a new tile and customize your dashboard.
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
