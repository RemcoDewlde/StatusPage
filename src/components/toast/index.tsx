import { FC, useEffect, useState } from "react";
import { Transition } from '@headlessui/react';

type ToastType = 'success' | 'error' | 'warning';

type ToastProps = {
  message: string;
  type: ToastType;
  id: number;
  removeToast: (id: number) => void;
  closable?: boolean;
};

const Toast: FC<ToastProps> = ({ message, type, id, removeToast, closable }) => {

  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        removeToast(id);
      }, 300);
    }, 300000);

    return () => clearTimeout(timer);
  }, [id, removeToast]);

  const typeMap = {
    success: {
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      icon: (
          <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
          </svg>
      ),
    },
    error: {
      bgColor: 'bg-red-500',
      textColor: 'text-red-500',
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
      ),
    },
    warning: {
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
      ),
    },
  };

  const { bgColor, textColor, icon } = typeMap[type];

  return (
      <div className="fixed top-4 right-4 z-50 w-96 top-12">
        <Transition
            show={show}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
          <div className="flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className={`flex items-center justify-center w-12 ${bgColor}`}>
              {icon}
            </div>
            <div className="px-4 py-2 -mx-3 flex-grow">
              <div className="mx-3">
              <span className={`font-semibold ${textColor} dark:${textColor.replace('500', '400')}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
                <p className="text-sm text-gray-600 dark:text-gray-200">{message}</p>
              </div>
            </div>
            {closable && (
                <button onClick={() => setShow(false)} className="px-4 py-2 text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-400">
                  &times;
                </button>
            )}
          </div>
        </Transition>
      </div>
  );
};

export default Toast;