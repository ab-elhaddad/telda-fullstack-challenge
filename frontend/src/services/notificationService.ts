import { useToast } from '@/components/ui/toast';

// Types
type NotificationType = 'success' | 'error' | 'info' | 'warning';
type NotificationOptions = {
  duration?: number;
  actionLabel?: string;
  actionCallback?: () => void;
};

// Default durations for different notification types
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  info: 4000,
  warning: 5000
};

/**
 * Notification service for displaying consistent toast messages throughout the application
 */
export class NotificationService {
  private static instance: NotificationService;
  private toastFunction: ReturnType<typeof useToast> | null = null;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize the service with the toast hook
  public init(toast: ReturnType<typeof useToast>): void {
    this.toastFunction = toast;
  }

  // Display a notification
  public notify(
    message: string, 
    type: NotificationType = 'info', 
    options: NotificationOptions = {}
  ): void {
    if (!this.toastFunction) {
      console.warn('NotificationService not initialized. Call init() with the useToast hook first.');
      return;
    }

    const duration = options.duration || DEFAULT_DURATIONS[type];
    
    this.toastFunction.showToast(message, type, duration);
  }

  // Shortcuts for common notification types
  public success(message: string, options: NotificationOptions = {}): void {
    this.notify(message, 'success', options);
  }

  public error(message: string, options: NotificationOptions = {}): void {
    this.notify(message, 'error', options);
  }

  public info(message: string, options: NotificationOptions = {}): void {
    this.notify(message, 'info', options);
  }

  public warning(message: string, options: NotificationOptions = {}): void {
    this.notify(message, 'warning', options);
  }

  // Format and display API errors
  public apiError(error: unknown): void {
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      message = String((error as { message: unknown }).message);
    }
    
    this.error(message, { duration: DEFAULT_DURATIONS.error });
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();

/**
 * Hook to initialize and use the notification service
 */
export function useNotification() {
  const toast = useToast();
  
  // Initialize the notification service with the toast hook
  if (toast) {
    notificationService.init(toast);
  }
  
  return notificationService;
}
