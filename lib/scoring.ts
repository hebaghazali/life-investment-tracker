import { DayEntryWithInvestments } from "./types";

/**
 * Calculate a numeric intensity for a day based on investments and mood.
 * Returns a value from 0 to 5 (or higher) for use in calendar coloring.
 */
export function calculateDayIntensity(entry: DayEntryWithInvestments): number {
  const investmentSum = entry.investments.reduce(
    (sum, inv) => sum + inv.score,
    0
  );
  const moodBonus = entry.mood || 0;
  
  // Combine investment scores (0-18 possible) with mood (0-5)
  // Normalize to a reasonable scale
  return Math.round((investmentSum + moodBonus) / 4);
}

/**
 * Get Tailwind background class based on intensity level.
 */
export function getIntensityColorClass(intensity: number): string {
  if (intensity === 0) return "bg-zinc-100 hover:bg-zinc-200";
  if (intensity <= 2) return "bg-emerald-100 hover:bg-emerald-200";
  if (intensity <= 4) return "bg-emerald-200 hover:bg-emerald-300";
  if (intensity <= 6) return "bg-emerald-300 hover:bg-emerald-400";
  return "bg-emerald-400 hover:bg-emerald-500";
}

