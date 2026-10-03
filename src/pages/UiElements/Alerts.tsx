import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

const Alert = ({ type, message, onClose }: AlertProps) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const duration = type === 'error' ? 3000 : 2500;
    const id =
      type === 'success'
        ? toast.success(message, { duration })
        : type === 'error'
          ? toast.error(message, { duration })
          : toast(message, {
              duration,
              icon: type === 'warning' ? '!' : 'i',
              style:
                type === 'warning'
                  ? { background: '#fff8ef', color: '#8a5410' }
                  : { background: '#f5f9ff', color: '#1f4c93' },
            });

    const timer = window.setTimeout(() => onCloseRef.current(), duration);

    return () => {
      window.clearTimeout(timer);
      toast.dismiss(id);
    };
  }, [message, type]);

  return null;
};

export default Alert;
