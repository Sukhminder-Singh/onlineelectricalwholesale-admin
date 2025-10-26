import { useEffect, useRef, useCallback } from 'react';

/**
 * Configuration options for the useIdleTimer hook
 */
interface UseIdleTimerOptions {
  timeout: number; // Time in milliseconds before timeout
  onTimeout: () => void; // Callback when timeout occurs
  onWarning?: (timeRemaining: number) => void; // Callback before timeout with remaining time in ms
  warningTime?: number; // Time before timeout to trigger warning (default: 60000ms / 1 minute)
  events?: string[]; // DOM events to track for activity
  enabled?: boolean; // Whether the timer is enabled (default: true)
}

/**
 * Custom hook to handle user idle timeout
 * 
 * @example
 * ```tsx
 * useIdleTimer({
 *   timeout: 15 * 60 * 1000, // 15 minutes
 *   onTimeout: () => logout(),
 *   onWarning: (timeRemaining) => alert(`Session expires in ${timeRemaining}ms`),
 *   warningTime: 1 * 60 * 1000, // 1 minute warning
 *   events: ['mousedown', 'mousemove', 'keypress', 'scroll'],
 *   enabled: isLoggedIn
 * });
 * ```
 * 
 * @returns An object with a `reset` method to manually reset the timer
 */

export const useIdleTimer = ({
  timeout,
  onTimeout,
  onWarning,
  warningTime = 60000, // default 1 minute warning
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
  enabled = true, // enabled by default
}: UseIdleTimerOptions) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    lastActivityTimeRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timer
    if (onWarning && warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        const timeSinceActivity = Date.now() - lastActivityTimeRef.current;
        if (timeSinceActivity >= timeout - warningTime) {
          onWarning(timeout - timeSinceActivity);
        }
      }, timeout - warningTime);
    }

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      const idleTime = Date.now() - lastActivityTimeRef.current;
      if (idleTime >= timeout) {
        onTimeout();
      }
    }, timeout);
  }, [timeout, onTimeout, onWarning, warningTime, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Clear timers if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, events, resetTimer]);

  const reset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { reset };
};

export default useIdleTimer;
