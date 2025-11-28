import { eachDayOfInterval, parseISO, formatISO } from "date-fns";
import type {
  DayEntry,
  DaySummary,
  InsightsData,
  InvestmentCategory,
  CategoryAggregate,
} from "./types";
import { INVESTMENT_CATEGORIES } from "./types";

/**
 * Transforms an array of DayEntry objects into structured InsightsData.
 * 
 * This function:
 * 1. Converts each entry into a DaySummary with computed totals
 * 2. Fills in missing days in the date range with null values (for chart continuity)
 * 3. Computes aggregate statistics across all entries
 * 4. Identifies most/least invested categories
 * 
 * @param entries - Array of day entries to analyze
 * @param range - Date range to consider (fills missing days)
 * @returns InsightsData with days and aggregates
 */
export function buildInsightsFromEntries(
  entries: DayEntry[],
  range: { from: Date; to: Date }
): InsightsData {
  // Step 1: Create a map of entries by date for quick lookup
  const entryMap = new Map<string, DayEntry>();
  entries.forEach((entry) => {
    entryMap.set(entry.date, entry);
  });

  // Step 2: Generate all days in range and create DaySummary for each
  const allDates = eachDayOfInterval({ start: range.from, end: range.to });
  const days: DaySummary[] = allDates.map((date) => {
    const dateStr = formatISO(date, { representation: "date" });
    const entry = entryMap.get(dateStr);

    if (!entry) {
      // Missing day - fill with null/zero values
      return {
        date: dateStr,
        mood: null,
        energy: null,
        totalInvestment: 0,
        categoryScores: INVESTMENT_CATEGORIES.reduce(
          (acc, cat) => ({ ...acc, [cat]: 0 }),
          {} as Record<InvestmentCategory, number>
        ),
        isMinimumViableDay: false,
        tags: [],
      };
    }

    // Transform entry into DaySummary
    const categoryScores: Record<InvestmentCategory, number> =
      INVESTMENT_CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: 0 }),
        {} as Record<InvestmentCategory, number>
      );

    entry.investments.forEach((inv) => {
      categoryScores[inv.category] = inv.score;
    });

    const totalInvestment = entry.investments.reduce(
      (sum, inv) => sum + inv.score,
      0
    );

    return {
      date: entry.date,
      mood: entry.mood ?? null,
      energy: entry.energy ?? null,
      totalInvestment,
      categoryScores,
      isMinimumViableDay: entry.isMinimumViableDay ?? false,
      tags: entry.tags,
    };
  });

  // Step 3: Compute aggregates
  const entriesWithData = days.filter((d) => d.totalInvestment > 0);
  const totalDaysLogged = entriesWithData.length;

  // Average mood and energy (filter out nulls)
  const moodValues = days.filter((d) => d.mood !== null).map((d) => d.mood!);
  const energyValues = days.filter((d) => d.energy !== null).map((d) => d.energy!);

  const averageMood =
    moodValues.length > 0
      ? moodValues.reduce((sum, m) => sum + m, 0) / moodValues.length
      : null;

  const averageEnergy =
    energyValues.length > 0
      ? energyValues.reduce((sum, e) => sum + e, 0) / energyValues.length
      : null;

  // MVD count
  const mvdCount = days.filter((d) => d.isMinimumViableDay).length;

  // Per-category aggregates
  const categoryAggregates: Record<InvestmentCategory, CategoryAggregate> =
    {} as Record<InvestmentCategory, CategoryAggregate>;

  INVESTMENT_CATEGORIES.forEach((cat) => {
    const categoryScores = entriesWithData.map((d) => d.categoryScores[cat]);
    const total = categoryScores.reduce((sum, score) => sum + score, 0);
    const daysWithCategory = categoryScores.filter((score) => score > 0).length;

    categoryAggregates[cat] = {
      total,
      average: daysWithCategory > 0 ? total / daysWithCategory : 0,
      dayCount: daysWithCategory,
    };
  });

  // Find most and least invested categories (by total)
  let mostInvestedCategory: InvestmentCategory | null = null;
  let leastInvestedCategory: InvestmentCategory | null = null;
  let maxTotal = -1;
  let minTotal = Infinity;

  INVESTMENT_CATEGORIES.forEach((cat) => {
    const total = categoryAggregates[cat].total;
    if (total > maxTotal) {
      maxTotal = total;
      mostInvestedCategory = cat;
    }
    // Only consider as least invested if there's any investment at all
    if (total > 0 && total < minTotal) {
      minTotal = total;
      leastInvestedCategory = cat;
    }
  });

  // If no investments at all, set both to null
  if (maxTotal === 0) {
    mostInvestedCategory = null;
    leastInvestedCategory = null;
  }

  return {
    days,
    aggregates: {
      averageMood,
      averageEnergy,
      totalDaysLogged,
      mvdCount,
      categoryAggregates,
      mostInvestedCategory,
      leastInvestedCategory,
    },
    dateRange: {
      from: formatISO(range.from, { representation: "date" }),
      to: formatISO(range.to, { representation: "date" }),
    },
  };
}

