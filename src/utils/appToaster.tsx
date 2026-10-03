import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: {
          background: '#faf7f2',
          color: '#7A330F',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 10px 24px -16px rgba(122, 51, 15, 0.45)',
          fontFamily: 'Alan Sans, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          maxWidth: '280px',
          padding: '8px 12px',
        },
        success: {
          duration: 2500,
          style: {
            background: '#f4fbf6',
            color: '#7A330F',
          },
        },
        error: {
          duration: 3000,
          style: {
            background: '#fff5f5',
            color: '#b32b2b',
          },
        },
      }}
    />
  );
}
