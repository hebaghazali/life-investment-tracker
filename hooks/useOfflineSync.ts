"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { saveDayEntry } from "@/app/actions/dayEntry";
import {
  getAllOfflineEntries,
  removeOfflineEntry,
  getPendingEntriesCount,
} from "@/lib/offlineQueue";

/**
 * Hook for managing offline sync of day entries
 * 
 * - Tracks online/offline status
 * - Automatically syncs pending entries when coming back online
 * - Provides manual sync capability
 */
export function useOfflineSync() {
  // Only run on client side - skip during SSR
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const user = useUser({ or: "return-null" });
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Sync all pending offline entries
   */
  const syncOfflineEntries = useCallback(async () => {
    // Wait for user to be loaded
    if (!user || !user.id || isSyncing) return;

    const pendingEntries = getAllOfflineEntries(user.id);
    
    if (pendingEntries.length === 0) {
      return;
    }

    console.log(`[OfflineSync] Starting sync of ${pendingEntries.length} entries`);
    setIsSyncing(true);

    let successCount = 0;
    let failCount = 0;

    for (const entry of pendingEntries) {
      try {
        // Call the server action with the offline entry data
        await saveDayEntry({
          date: entry.date,
          mood: entry.mood,
          energy: entry.energy,
          note: entry.note,
          isMinimumViableDay: entry.isMinimumViableDay,
          investments: entry.investments,
          tags: entry.tags,
        });

        // Remove from offline queue on success
        removeOfflineEntry(user.id, entry.date);
        successCount++;
        console.log(`[OfflineSync] Successfully synced entry for ${entry.date}`);
      } catch (error) {
        console.error(`[OfflineSync] Failed to sync entry for ${entry.date}:`, error);
        failCount++;
        // Keep in queue for retry later
      }
    }

    setIsSyncing(false);

    // Show user feedback
    if (successCount > 0) {
      const message = successCount === 1
        ? "Synced 1 offline entry"
        : `Synced ${successCount} offline entries`;
      toast.success(message);
    }

    if (failCount > 0) {
      const message = failCount === 1
        ? "Failed to sync 1 entry. Will retry later."
        : `Failed to sync ${failCount} entries. Will retry later.`;
      toast.error(message);
    }
  }, [user?.id, isSyncing]);

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    // Only run on client side after mount
    if (typeof window === "undefined" || !isMounted) return;

    const handleOnline = () => {
      console.log("[OfflineSync] Network online - checking for pending entries");
      setIsOnline(true);
      // Sync when coming back online
      syncOfflineEntries();
    };

    const handleOffline = () => {
      console.log("[OfflineSync] Network offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync on mount if online and have pending entries
    if (navigator.onLine && user?.id) {
      const pendingCount = getPendingEntriesCount(user.id);
      if (pendingCount > 0) {
        console.log(`[OfflineSync] Found ${pendingCount} pending entries on mount`);
        syncOfflineEntries();
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user?.id, syncOfflineEntries, isMounted]);

  return {
    isOnline,
    isSyncing,
    syncNow: syncOfflineEntries,
  };
}

