import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import ZeroState from "@/components/mozaic/ZeroState.tsx";
import { useMosaic } from "@/context/MosaicContext.tsx";
import ContentComponentFactory from "@/utils/ContentComponentFactory.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Settings2 } from "lucide-react";
import { useFormDialog } from "@/context/FormDialogContext.tsx";
import "./custom-mosaic-styles.css";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

const Home = () => {
    const { layout, tiles, titles, removeTile, setLayout } = useMosaic();
    const { openDialog } = useFormDialog();

    const handleEditTileClick = (id: string) => {
        openDialog(id);
    };

    return (
        <div className="custom-layout-container min-h-screen w-full bg-gray-100 dark:bg-gray-900 rounded-lg">
            <Mosaic<string>
                className="min-h-screen bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-inner rounded-lg border-none"
                value={layout}
                onChange={(newLayout) => setLayout(newLayout)}
                renderTile={(id, path) => {
                    const settings = tiles[id];
                    const title = titles[id];
                    return (
                        <MosaicWindow<string>
                            path={path}
                            title={title || "Untitled"}
                            toolbarControls={
                                <div className="mosaic-window-controls flex items-center space-x-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                            >
                                                <Settings2 className="h-4 w-4" />
                                                <span className="sr-only">Open settings menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 cursor-default">
                                            <DropdownMenuItem
                                                onSelect={() => handleEditTileClick(id)}
                                                className="flex items-center cursor-pointer"
                                            >
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={() => removeTile(id)}
                                                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                                            >
                                                <span>Remove</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            }
                        >
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex-1">
                                    <ContentComponentFactory
                                        viewType={settings.viewType}
                                        api={settings.api}
                                        additionalSettings={settings.additionalSettings}
                                    />
                                </div>
                            </div>
                        </MosaicWindow>
                    );
                }}
                resize={{ minimumPaneSizePercentage: 10 }}
                zeroStateView={<ZeroState />}
                initialValue={layout}
            />
        </div>
    );
};

export default Home;
