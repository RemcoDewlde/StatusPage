import { FC, useEffect, useState } from "react";
import { Transition } from '@headlessui/react';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  id: number;
  removeToast: (id: number) => void;
};

const Toast: FC<ToastProps> = ({ message, type, id, removeToast }) => {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        removeToast(id);
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`max-w-xs w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer mb-2 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="p-4">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
    </Transition>
  );
};

export default Toast;