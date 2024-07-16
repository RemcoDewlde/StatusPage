import { createContext, FC, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from '../components/toast';

export enum ToastType {
    Success = "success",
    Error = "error",
    Warning = "warning"
}
type ToastContextType = {
    addToast: (message: string, type: ToastType, closable?: boolean) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastProviderProps = {
    children: ReactNode;
};

type ToastState = {
    id: number;
    message: string;
    type: ToastType;
    closable?: boolean;
};

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const addToast = useCallback((message: string, type: ToastType, closable?: boolean) => {
        const id = Date.now();
        setToasts((prevToasts) => [...prevToasts, { id, message, type, closable }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-1">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        removeToast={removeToast}
                        closable={toast.closable}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
