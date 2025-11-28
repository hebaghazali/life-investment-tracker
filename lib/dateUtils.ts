/**
 * Date utility functions for normalizing and handling day entries.
 */

/**
 * Normalizes a date string (YYYY-MM-DD) to a UTC Date object at midnight.
 * 
 * This ensures consistent date handling across the application, particularly
 * for DayEntry records where we need to match on the exact date regardless
 * of timezone.
 * 
 * @param dateString - ISO date string in format "YYYY-MM-DD"
 * @returns Date object normalized to UTC midnight (T00:00:00.000Z)
 * 
 * @example
 * normalizeDayDate("2024-11-28") // Returns: 2024-11-28T00:00:00.000Z
 */
export function normalizeDayDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00.000Z");
}

