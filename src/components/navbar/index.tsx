import {useEffect, useState} from 'react';
import {invoke} from '@tauri-apps/api/tauri'
import {Command} from "../../utils/command.enum.ts";
import {Route, Routes} from "react-router-dom";
import routes from "../../providers/routeProvider.ts";
import {Navbar as ShadNavbar, NavbarContent, NavbarLink} from '@shadcn/ui'; // Importing ShadCN components

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
        <ShadNavbar>
            <NavbarContent>
                <div className="flex items-center justify-between">
                    <div className="text-xl font-bold">
                        {name}
                    </div>
                    <div className="flex space-x-4">
                        {routes.map((route, index) => (
                            <NavbarLink key={index} href={route.path} className="hover:text-blue-500">
                                {route.name}
                            </NavbarLink>
                        ))}
                    </div>
                </div>
            </NavbarContent>
            <Routes>
                {routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={<route.component/>}
                    />
                ))}
            </Routes>
        </ShadNavbar>
    );
};

export default Navbar;
