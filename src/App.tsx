import './App.css';
import AppLayout from './components/layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import { useEffect } from 'react';
import { PageSettingType } from './utils/types';
import { useApiSettingsStore } from './store/apiSettingsStore';
import { ToastType, useToastStore } from './store/toastStore.ts';

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
]);

const App = () => {
    const addToast = useToastStore((s) => s.addToast);
    useEffect(() => {
        const loadSettings = async () => {
            const loadedSettings = await PageSettingType.load((message: string) =>
                addToast(message, ToastType.Info, true),
            );
            if (loadedSettings) {
                useApiSettingsStore.getState().setSettings(loadedSettings.settings);
            }
        };
        loadSettings();
    }, []);

    return (
        <RouterProvider router={router} />
    );
};

export default App;
