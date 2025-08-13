import { useToastStore } from '@/store/toastStore';
import Toast from '@/components/toast';

const ToastPortal = () => {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-1">
      {toasts.map(t => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} removeToast={removeToast} closable={t.closable} />
      ))}
    </div>
  );
};

export default ToastPortal;

