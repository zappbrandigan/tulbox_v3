import { AlertCircle } from 'lucide-react';
import React, { createContext, useState, ReactNode } from 'react';

interface ToastProps {
  message?: string;
  icon?: ReactNode;
}

interface ToastContextType {
  showToast: (props?: Partial<ToastProps>) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = ({
    message = 'Copied to clipboard!',
    icon = <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-300" />,
  }: Partial<ToastProps> = {}) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="alert"
          className="fixed bottom-10 right-4 z-50 max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 bg-white dark:bg-gray-900 dark:text-gray-100 border-l-4 border-blue-500 shadow-xl rounded-lg text-sm flex items-start gap-3 transition-all duration-300"
        >
          {toast.icon && (
            <div className="flex-shrink-0 mt-0.5 w-5 h-5">{toast.icon}</div>
          )}

          <div className="flex-1">
            <p className="text-sm leading-snug break-words">{toast.message}</p>
            {/* Optional subtitle or extra content can go here */}
            {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Secondary text</p> */}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
