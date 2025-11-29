"use client";

import { useEffect, useState } from "react";

/**
 * useOnlineStatus Hook
 * 
 * Tracks the browser's online/offline status and returns a boolean.
 * Useful for showing offline indicators or disabling features when offline.
 * 
 * @returns {boolean} isOnline - True if the browser is online, false otherwise
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOnline = useOnlineStatus();
 *   
 *   if (!isOnline) {
 *     return <div>You are offline</div>;
 *   }
 *   
 *   return <div>You are online</div>;
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler for when the browser goes online
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[Network] Connection restored");
    };

    // Handler for when the browser goes offline
    const handleOffline = () => {
      setIsOnline(false);
      console.log("[Network] Connection lost");
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

