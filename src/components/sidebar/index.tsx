import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Command } from "@/enums/command.enum.ts";
import { Link } from "react-router-dom";
import routes from "../../providers/routeProvider";
import { ToastType, useToast } from "../../context/toastContext.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CogIcon } from "lucide-react";

const Sidebar = () => {
    const [name, setName] = useState("dev");
    const [version, setVersion] = useState("dev");
    const { addToast } = useToast();

    useEffect(() => {
        const fetchName = async () => {
            try {
                let appName: string = await invoke(Command.GetApplicationName.toString());
                setName(appName.toString());
            } catch (error) {
                addToast("Error fetching name", ToastType.Error, true);
            }
        };
        fetchName();
    }, []);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                let appVersion: string = await invoke(Command.GetApplicationVersion.toString());
                setVersion(appVersion.toString());
            } catch (error) {
                console.error("Error fetching version:", error);
            }
        };
        fetchVersion();
    }, []);

    const showVersion = () => {
        addToast(`v${version} is the latest version`, ToastType.Success, true);
    };

    return (
        <div className="flex flex-col h-screen w-16 bg-gray-800 text-white">
            <div className="p-3 text-xl font-bold flex items-center justify-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    {name.charAt(0).toUpperCase()}
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <nav className="space-y-2 p-2">
                    {routes
                        .filter(route => route.name !== 'Settings')
                        .map(route => (
                            <Link key={route.path} to={route.path}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full hover:bg-gray-700 hover:text-white"
                                >
                                    <route.icon className="h-5 w-5" />
                                    <span className="sr-only">{route.name}</span>
                                </Button>
                            </Link>
                        ))}
                </nav>
            </ScrollArea>
            <div className="p-2 space-y-2">
                <Link to={'/settings'}>
                    <Button variant="ghost" size="icon" className="w-full hover:bg-gray-700 hover:text-white">
                        <CogIcon className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                </Link>
                <div
                    className="text-xs text-gray-400 text-center hover:text-white cursor-pointer"
                    onClick={showVersion}
                >
                    v{version}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;