import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react"; // Using Lucide icons for consistency

interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message: React.ReactNode;
  variant?: "inline" | "block";
}

/**
 * FormError component for consistent error styling throughout the application.
 * Can be used both for API/general errors and form validation errors.
 */
const FormError = forwardRef<HTMLDivElement, FormErrorProps>((
  { message, variant = "inline", className, ...props },
  ref
) => {
  if (!message) return null;

  if (variant === "block") {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-sm p-3 rounded-md",
          className
        )}
        {...props}
      >
        <div className="flex items-start">
          <X className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-2 text-red-500 dark:text-red-400 text-xs mt-1",
        className
      )}
      {...props}
    >
      <X className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
});

FormError.displayName = "FormError";

export default FormError;
