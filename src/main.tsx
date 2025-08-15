import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import FormDialogPortal from '@/components/overlays/FormDialogPortal';
import ToastPortal from '@/components/overlays/ToastPortal';
import SettingsDialogPortal from '@/components/overlays/SettingsDialogPortal';
import { useMosaicStore } from '@/store/mosaicStore';
import { useRefreshStore } from '@/store/refreshStore';

const StoreHydrator = () => {
    const hydrateMosaic = useMosaicStore(s => s.hydrate);
    const hydrateRefresh = useRefreshStore(s => s.hydrate);
    useEffect(() => {
        hydrateMosaic();
        hydrateRefresh();
    }, [hydrateMosaic, hydrateRefresh]);
    return null;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <StoreHydrator />
        <App />
        <FormDialogPortal />
        <ToastPortal />
        <SettingsDialogPortal />
    </React.StrictMode>,
);
