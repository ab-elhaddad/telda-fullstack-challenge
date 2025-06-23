import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

// Types
type ToastType = "success" | "error" | "info" | "warning";
type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({
  children,
  position = "top-right"
}: {
  children: ReactNode;
  position?: ToastPosition;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Generate a unique ID for each toast
  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Show a new toast
  const showToast = (message: string, type: ToastType = "info", duration = 5000) => {
    const newToast: Toast = {
      id: generateId(),
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  // Hide a specific toast
  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Auto-remove toasts after their duration
  useEffect(() => {
    if (toasts.length) {
      const timers = toasts.map(toast => {
        return setTimeout(() => {
          hideToast(toast.id);
        }, toast.duration);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [toasts]);

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4 flex flex-col items-end",
    "top-left": "top-4 left-4 flex flex-col items-start",
    "bottom-right": "bottom-4 right-4 flex flex-col items-end",
    "bottom-left": "bottom-4 left-4 flex flex-col items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 flex flex-col items-center",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center"
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      {mounted && createPortal(
        <div className={cn("fixed z-50", positionClasses[position])}>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// Individual Toast Component
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { id, message, type } = toast;

  // Type-specific styling
  const typeClasses = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
    info: "bg-blue-100 border-blue-500 text-blue-800"
  };

  // Type-specific icons
  const typeIcons = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    )
  };

  return (
    <div
      className={cn(
        "mb-3 w-80 rounded-md border-l-4 shadow-md transition-all duration-500 ease-in-out",
        typeClasses[type]
      )}
      role="alert"
      id={id}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
          {typeIcons[type]}
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto inline-flex flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}
