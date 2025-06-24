import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'danger' 
  | 'ghost' 
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      fullWidth = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variant styles - Netflix inspired
    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-white hover:bg-primary hover:brightness-110 hover:shadow-glow transition-all',
      secondary: 'bg-gray-800 text-white hover:bg-gray-700 transition-colors',
      outline: 'bg-transparent border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-colors',
      danger: 'bg-red-600 text-white hover:bg-red-700 hover:brightness-110 transition-all',
      ghost: 'bg-transparent text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors',
      link: 'bg-transparent text-primary hover:text-primary/80 hover:brightness-110 p-0 h-auto transition-colors'
    };
    
    // Size styles
    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'text-xs px-2.5 py-1.5 rounded',
      sm: 'text-sm px-3 py-2 rounded-md',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-5 py-3 rounded-md',
      icon: 'p-2 rounded-md'
    };

    // Loading indicator styles based on size
    const loadingSize = {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      icon: 'h-4 w-4'
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-60 cursor-not-allowed' : '',
          variant === 'primary' ? 'shadow-md hover:shadow-lg' : (variant !== 'link' ? 'shadow-sm' : ''),
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className={cn(
                'animate-spin text-current',
                loadingSize[size]
              )}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={cn('flex items-center', isLoading ? 'invisible' : '')}>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

