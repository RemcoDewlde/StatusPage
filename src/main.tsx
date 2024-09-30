import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApiProvider } from './context/apiContext.tsx';
import { ToastProvider } from './context/toastContext.tsx';
import { MosaicProvider } from '@/context/MosaicContext.tsx';
import { FormDialogProvider } from '@/context/FormDialogContext.tsx';
import { RefreshProvider } from '@/context/RefreshContext.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ToastProvider>
            <RefreshProvider>
                <MosaicProvider>
                    <ApiProvider>
                        <FormDialogProvider>
                            <App />
                        </FormDialogProvider>
                    </ApiProvider>
                </MosaicProvider>
            </RefreshProvider>
        </ToastProvider>
    </React.StrictMode>,
);
