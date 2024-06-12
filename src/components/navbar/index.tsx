import {useEffect, useState} from 'react';
import {invoke} from '@tauri-apps/api/tauri'
import {Command} from "../../utils/command.enum.ts";
import {Link} from "react-router-dom";
import routes from "../../providers/routeProvider.ts";

const Navbar = () => {
    const [name, setName] = useState('dev');

    useEffect(() => {
        const fetchName = async () => {
            try {
                let appName: string = await invoke(Command.GetApplicationName);
                setName(appName.toString());
            } catch (error) {
                console.error("Error fetching name:", error);
            }
        };

        fetchName();
    }, []);

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-xl font-bold">
                    {name}
                </div>
                <div className="flex space-x-4">
                    {routes.map((route, index) => (
                        <Link
                            key={index}
                            to={route.path}
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <span className="flex items-center space-x-1">
                                <route.icon />
                                <span>{route.name}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
