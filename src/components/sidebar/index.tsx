import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Command } from "@/enums/command.enum.ts";
import { Link } from "react-router-dom";
import routes from "../../providers/routeProvider";
import { ToastType, useToast } from "../../context/toastContext.tsx";

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
        // TODO: Add update check logic
        addToast(` v${version} is the latest version`, ToastType.Success, true);
    }

    return (
        <aside
            className="flex flex-col w-64 h-screen px-5 py-8 overflow-y-auto bg-white border-r dark:bg-gray-900 dark:border-gray-700">
            <div className="flex flex-col items-center">
                {/*<img className="w-auto h-7 mb-4" src="https://merakiui.com/images/logo.svg" alt="Logo" />*/}
                <div className="text-gray-600 dark:text-gray-300 text-lg font-semibold">{name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm hover:cursor-pointer" onClick={showVersion}>v{version}</div>
            </div>
            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav className="-mx-3 space-y-3">
                    {routes.map((route) => (
                        <Link
                            key={route.path}
                            to={route.path}
                            className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700"
                        >
                            <route.icon className="w-5 h-5" />
                            <span className="mx-2 text-sm font-medium">{route.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
