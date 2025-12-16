
import React from 'react';
import { toast, Toaster } from 'react-hot-toast';



const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#a3e635',
            border: '1px solid rgba(132, 204, 22, 0.3)',
            boxShadow: '0 0 15px rgba(132, 204, 22, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#a3e635',
              secondary: '#1a1a1a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1a1a1a',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;