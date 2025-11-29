"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

/**
 * OfflineSyncProvider Component
 * 
 * Enables automatic synchronization of offline day entries when the app
 * comes back online. This component should be included once in the root
 * layout to provide app-wide offline sync functionality.
 * 
 * Features:
 * - Monitors online/offline status
 * - Automatically syncs pending entries when connection is restored
 * - Runs sync on mount if there are pending entries
 */
export function OfflineSyncProvider() {
  // Hook handles all the sync logic and event listeners
  useOfflineSync();

  // This component has no UI - it only provides side effects
  return null;
}

