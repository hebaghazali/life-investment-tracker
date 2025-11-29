"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister Component
 * 
 * Registers the service worker for PWA functionality.
 * This component should be included in the root layout to ensure
 * the service worker is registered on all pages.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service Worker registered successfully:", registration.scope);

          // Check for updates on page load
          registration.update();

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker is installed but not yet activated
                  console.log("[PWA] New service worker available");
                  
                  // Optionally notify the user about the update
                  // You could use a toast notification here:
                  // toast.info("App update available. Refresh to get the latest version.");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // Optional: Listen for controller change (when a new SW takes over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] Service Worker controller changed");
      });
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // In development, log that SW is disabled
      console.log("[PWA] Service Worker disabled in development mode");
    }
  }, []);

  // This component doesn't render anything
  return null;
}

