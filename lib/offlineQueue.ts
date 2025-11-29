/**
 * Offline Queue Utility
 * 
 * Manages localStorage-based queue for day entries saved while offline.
 * Entries are keyed by userId and date to support multi-user devices.
 */

import type { SaveDayEntryInput } from "@/app/actions/dayEntry";

const STORAGE_KEY = "lit_offline_entries_v1";

export interface OfflineEntryPayload extends SaveDayEntryInput {
  lastUpdatedAt: string; // ISO timestamp
}

interface OfflineEntriesStore {
  [userId: string]: {
    [date: string]: OfflineEntryPayload;
  };
}

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Load all offline entries from localStorage
 */
function loadStore(): OfflineEntriesStore {
  if (!isBrowser()) return {};
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("[OfflineQueue] Failed to load offline entries:", error);
    return {};
  }
}

/**
 * Save offline entries store to localStorage
 */
function saveStore(store: OfflineEntriesStore): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("[OfflineQueue] Failed to save offline entries:", error);
  }
}

/**
 * Save an entry to the offline queue
 * Last write wins - overwrites any existing entry for the same date
 */
export function saveOfflineEntry(
  userId: string,
  payload: SaveDayEntryInput
): void {
  const store = loadStore();
  
  if (!store[userId]) {
    store[userId] = {};
  }
  
  store[userId][payload.date] = {
    ...payload,
    lastUpdatedAt: new Date().toISOString(),
  };
  
  saveStore(store);
  console.log(`[OfflineQueue] Saved offline entry for ${payload.date}`);
}

/**
 * Get all pending offline entries for a user
 */
export function getAllOfflineEntries(
  userId: string
): OfflineEntryPayload[] {
  const store = loadStore();
  const userEntries = store[userId] || {};
  
  return Object.values(userEntries);
}

/**
 * Remove an entry from the offline queue after successful sync
 */
export function removeOfflineEntry(userId: string, date: string): void {
  const store = loadStore();
  
  if (store[userId]?.[date]) {
    delete store[userId][date];
    
    // Clean up empty user entries
    if (Object.keys(store[userId]).length === 0) {
      delete store[userId];
    }
    
    saveStore(store);
    console.log(`[OfflineQueue] Removed offline entry for ${date}`);
  }
}

/**
 * Get a specific offline entry for a date
 * Returns null if no offline entry exists
 */
export function getOfflineEntryForDate(
  userId: string,
  date: string
): OfflineEntryPayload | null {
  const store = loadStore();
  return store[userId]?.[date] || null;
}

/**
 * Check if a specific date has a pending offline entry
 */
export function hasPendingEntryForDate(
  userId: string,
  date: string
): boolean {
  return getOfflineEntryForDate(userId, date) !== null;
}

/**
 * Get count of all pending offline entries for a user
 */
export function getPendingEntriesCount(userId: string): number {
  const store = loadStore();
  return Object.keys(store[userId] || {}).length;
}

