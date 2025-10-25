export { default as Toast } from './Toast';
export { default as ToastContainer } from './ToastContainer';
export type { ToastProps } from './Toast';
export type { ToastData } from './ToastContainer';

// Utility function to show toast notifications
export const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration?: number
) => {
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast({
      type,
      title,
      message,
      duration
    });
  }
};

// Convenience functions for different toast types
export const showSuccessToast = (title: string, message: string, duration?: number) => {
  showToast('success', title, message, duration);
};

export const showErrorToast = (title: string, message: string, duration?: number) => {
  showToast('error', title, message, duration);
};

export const showWarningToast = (title: string, message: string, duration?: number) => {
  showToast('warning', title, message, duration);
};

export const showInfoToast = (title: string, message: string, duration?: number) => {
  showToast('info', title, message, duration);
}; 