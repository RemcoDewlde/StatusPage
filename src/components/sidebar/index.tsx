import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Command } from '@/enums/command.enum.ts';
import { Link } from 'react-router-dom';
import { ToastType, useToast } from '../../context/toastContext.tsx';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CogIcon, CopyPlus, PanelsTopLeft } from 'lucide-react';
import Home from '@/pages/Home';
import Settings from '@/pages/Settings';
import { useFormDialog } from '@/context/FormDialogContext.tsx';


const Sidebar = () => {
    const [name, setName] = useState('dev');
    const [version, setVersion] = useState('dev');
    const { addToast } = useToast();
    const { openDialog } = useFormDialog();

    const handleAddTile = () => {
        openDialog();
    };

    const routes = [
        { component: Home, path: '/', name: ('Dashboard'), icon: PanelsTopLeft },
        { component: Settings, path: '/settings', name: ('Settings'), icon: CogIcon },
        {
            name: 'Add Status Tile',
            icon: CopyPlus,
            onClick: () => {
                handleAddTile();
            },
        },
    ];

    useEffect(() => {
        const fetchName = async () => {
            try {
                let appName: string = await invoke(Command.GetApplicationName.toString());
                setName(appName.toString());
            } catch (error) {
                addToast('Error fetching name', ToastType.Error, true);
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
                console.error('Error fetching version:', error);
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
                        .filter((route) => route.name !== 'Settings')
                        .map((route) => {
                            const content = (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full hover:bg-gray-700 hover:text-white"
                                    onClick={route.onClick}
                                >
                                    <route.icon className="h-5 w-5" />
                                    <span className="sr-only">{route.name}</span>
                                </Button>
                            );

                            return route.path ? (
                                <Link key={route.path} to={route.path}>
                                    {content}
                                </Link>
                            ) : (
                                <div key={route.name}>{content}</div>
                            );
                        })}
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
