import './App.css';
import AppLayout from './components/layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import { useEffect } from 'react';
import { PageSettingType } from './utils/types';
import { useApiSettingsStore } from './store/apiSettingsStore';
import { ToastType, useToast } from './context/toastContext';
import { DndProvider } from 'react-dnd';
import { MosaicDrawerProvider } from './context/MosaicDrawerContext';
import { HTML5Backend } from 'react-dnd-html5-backend';

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'settings',
                element: <Settings />,
            },
        ],
    },
]);

const App = () => {
    const { addToast } = useToast ? useToast() : {
        addToast: () => {
        },
    };
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
        <DndProvider backend={HTML5Backend} context={window}>
            <MosaicDrawerProvider>
                <RouterProvider router={router} />
            </MosaicDrawerProvider>
        </DndProvider>
    );
};

export default App;
