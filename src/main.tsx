import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApiProvider } from './context/apiContext.tsx';
import { ToastProvider } from './context/toastContext.tsx';
import { MosaicProvider } from '@/context/MosaicContext.tsx';
import { FormDialogProvider } from '@/context/FormDialogContext.tsx';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ToastProvider>
            <MosaicProvider>
                <ApiProvider>
                    <FormDialogProvider>
                        <App />
                    </FormDialogProvider>
                </ApiProvider>
            </MosaicProvider>
        </ToastProvider>
    </React.StrictMode>,
);
