import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import ZeroState from "@/components/mozaic/ZeroState.tsx";
import { useMosaic } from "@/context/MosaicContext.tsx";
import ContentComponentFactory from "@/utils/ContentComponentFactory.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Settings2 } from "lucide-react";
import { useFormDialog } from "@/context/FormDialogContext.tsx";
// @ts-ignore
import domtoimage from "dom-to-image-more";
import "./custom-mosaic-styles.css";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { useEffect, useRef, useState } from "react";
import { DevSettingsType } from "@/utils/types.ts";

const Home = () => {
    const tileRefs = useRef<{ [id: string]: HTMLElement | null }>({});
    const { layout, tiles, titles, removeTile, setLayout } = useMosaic();
    const [devSettings, setDevSettings] = useState<DevSettingsType | null>(null);
    const { openDialog } = useFormDialog();

    useEffect(() => {
        const loadSettings = async () => {
            const loadedDevSettings = await DevSettingsType.load();
            setDevSettings(loadedDevSettings);
        };

        loadSettings();
    }, []);

    const handleEditTileClick = (id: string) => {
        openDialog(id);
    };

    const handleCopyAsImageClick = (id: string) => {
        // TODO: fix the styling for the exportred image
        const node = tileRefs.current[id];
        if (node) {
            domtoimage.toPng(node)
                .then((dataUrl: any) => {
                    const link = document.createElement("a");
                    link.download = `${id}.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((error: any) => {
                    console.error("Error generating image:", error);
                });
        } else {
            console.error("No node found for id:", id);
        }
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
                                            {devSettings?.devMode && (
                                                <DropdownMenuItem
                                                    onSelect={() => handleCopyAsImageClick(id)}
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <span>Copy as Image</span>
                                                </DropdownMenuItem>
                                            )}
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
                            <div className="p-4 flex flex-col h-full"
                                 ref={(node) => {
                                     tileRefs.current[id] = node;
                                 }}>
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
