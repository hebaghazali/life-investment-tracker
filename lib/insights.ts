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

/**
 * Calculates streak statistics from an array of DaySummary objects.
 * 
 * - currentStreak: consecutive days from the most recent date backwards where totalInvestment > 0
 * - longestStreak: longest run of consecutive days with investment in the entire range
 * 
 * @param days - Array of day summaries (should be sorted by date ascending)
 * @returns Object with currentStreak and longestStreak counts
 */
export function calculateStreaks(days: DaySummary[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (days.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak (working backwards from most recent day)
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].totalInvestment > 0) {
      currentStreak++;
    } else {
      break; // Stop at first day without investment
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (const day of days) {
    if (day.totalInvestment > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Analyzes tag usage across days with investment data.
 * 
 * For each unique tag, computes:
 * - count: number of days the tag appears
 * - avgMood: average mood on days with this tag (null if no mood data)
 * - avgEnergy: average energy on days with this tag (null if no energy data)
 * 
 * @param days - Array of day summaries
 * @returns Array of tag analytics sorted by count (descending)
 */
export function calculateTagAnalytics(days: DaySummary[]): Array<{
  tag: string;
  count: number;
  avgMood: number | null;
  avgEnergy: number | null;
}> {
  // Only consider days with investment data
  const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);

  // Build a map: tag -> { count, moodSum, moodCount, energySum, energyCount }
  const tagMap = new Map<
    string,
    {
      count: number;
      moodSum: number;
      moodCount: number;
      energySum: number;
      energyCount: number;
    }
  >();

  for (const day of daysWithInvestment) {
    for (const tag of day.tags) {
      const existing = tagMap.get(tag) || {
        count: 0,
        moodSum: 0,
        moodCount: 0,
        energySum: 0,
        energyCount: 0,
      };

      existing.count++;

      if (day.mood !== null) {
        existing.moodSum += day.mood;
        existing.moodCount++;
      }

      if (day.energy !== null) {
        existing.energySum += day.energy;
        existing.energyCount++;
      }

      tagMap.set(tag, existing);
    }
  }

  // Transform to array and compute averages
  const result = Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    count: data.count,
    avgMood: data.moodCount > 0 ? data.moodSum / data.moodCount : null,
    avgEnergy: data.energyCount > 0 ? data.energySum / data.energyCount : null,
  }));

  // Sort by count descending
  result.sort((a, b) => b.count - a.count);

  return result;
}

/**
 * Computes category-mood correlations by comparing mood on days with higher vs lower category investment.
 * 
 * For each category:
 * - Calculates the category's average score across all days
 * - Compares average mood on days where category score > average vs days below average
 * - Only includes categories with at least 2 days in each group
 * 
 * @param days - Array of day summaries
 * @returns Array of category correlation insights with mood deltas
 */
export function computeCategoryMoodCorrelations(days: DaySummary[]): Array<{
  category: InvestmentCategory;
  moodDelta: number;
  moodAbove: number;
  moodBelow: number;
  daysAbove: number;
  daysBelow: number;
}> {
  const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);
  const results: Array<{
    category: InvestmentCategory;
    moodDelta: number;
    moodAbove: number;
    moodBelow: number;
    daysAbove: number;
    daysBelow: number;
  }> = [];

  for (const category of INVESTMENT_CATEGORIES) {
    // Calculate category average
    const categoryScores = daysWithInvestment.map((d) => d.categoryScores[category]);
    const categoryAvg = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;

    // Skip if category average is 0 (no investment in this category)
    if (categoryAvg === 0) continue;

    // Split days into above and below average
    const daysAboveAvg = daysWithInvestment.filter(
      (d) => d.categoryScores[category] > categoryAvg && d.mood !== null
    );
    const daysBelowAvg = daysWithInvestment.filter(
      (d) => d.categoryScores[category] <= categoryAvg && d.mood !== null
    );

    // Need at least 2 days in each group
    if (daysAboveAvg.length < 2 || daysBelowAvg.length < 2) continue;

    // Calculate average mood for each group
    const moodAbove = daysAboveAvg.reduce((sum, d) => sum + d.mood!, 0) / daysAboveAvg.length;
    const moodBelow = daysBelowAvg.reduce((sum, d) => sum + d.mood!, 0) / daysBelowAvg.length;
    const moodDelta = moodAbove - moodBelow;

    results.push({
      category,
      moodDelta,
      moodAbove,
      moodBelow,
      daysAbove: daysAboveAvg.length,
      daysBelow: daysBelowAvg.length,
    });
  }

  // Sort by absolute mood delta (biggest differences first)
  results.sort((a, b) => Math.abs(b.moodDelta) - Math.abs(a.moodDelta));

  return results;
}

/**
 * Computes tag-mood-energy correlations by analyzing patterns on days with specific tags.
 * 
 * For each tag:
 * - Calculates average mood and energy on days with that tag
 * - Only includes tags with at least 2 days of data
 * 
 * @param days - Array of day summaries
 * @returns Array of tag correlation insights
 */
export function computeTagMoodEnergyCorrelations(days: DaySummary[]): Array<{
  tag: string;
  moodAverage: number | null;
  energyAverage: number | null;
  dayCount: number;
}> {
  const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);
  
  // Build a map of tag -> days with that tag
  const tagMap = new Map<string, DaySummary[]>();
  
  for (const day of daysWithInvestment) {
    for (const tag of day.tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag)!.push(day);
    }
  }

  const results: Array<{
    tag: string;
    moodAverage: number | null;
    energyAverage: number | null;
    dayCount: number;
  }> = [];

  for (const [tag, tagDays] of tagMap.entries()) {
    // Need at least 2 days
    if (tagDays.length < 2) continue;

    // Calculate average mood
    const daysWithMood = tagDays.filter((d) => d.mood !== null);
    const moodAverage = daysWithMood.length > 0
      ? daysWithMood.reduce((sum, d) => sum + d.mood!, 0) / daysWithMood.length
      : null;

    // Calculate average energy
    const daysWithEnergy = tagDays.filter((d) => d.energy !== null);
    const energyAverage = daysWithEnergy.length > 0
      ? daysWithEnergy.reduce((sum, d) => sum + d.energy!, 0) / daysWithEnergy.length
      : null;

    results.push({
      tag,
      moodAverage,
      energyAverage,
      dayCount: tagDays.length,
    });
  }

  // Sort by day count (most frequent tags first)
  results.sort((a, b) => b.dayCount - a.dayCount);

  return results;
}

/**
 * Computes correlations between MVD days and non-MVD days.
 * 
 * Compares:
 * - Average mood on MVD vs non-MVD days
 * - Average energy on MVD vs non-MVD days
 * - Average total investment on MVD vs non-MVD days
 * 
 * @param days - Array of day summaries
 * @returns MVD correlation insights
 */
export function computeMvdCorrelations(days: DaySummary[]): {
  mvdMoodAvg: number | null;
  regularMoodAvg: number | null;
  mvdEnergyAvg: number | null;
  regularEnergyAvg: number | null;
  mvdInvestmentAvg: number;
  regularInvestmentAvg: number;
  mvdCount: number;
  regularCount: number;
} {
  const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);
  
  const mvdDays = daysWithInvestment.filter((d) => d.isMinimumViableDay);
  const regularDays = daysWithInvestment.filter((d) => !d.isMinimumViableDay);

  // MVD mood average
  const mvdDaysWithMood = mvdDays.filter((d) => d.mood !== null);
  const mvdMoodAvg = mvdDaysWithMood.length > 0
    ? mvdDaysWithMood.reduce((sum, d) => sum + d.mood!, 0) / mvdDaysWithMood.length
    : null;

  // Regular mood average
  const regularDaysWithMood = regularDays.filter((d) => d.mood !== null);
  const regularMoodAvg = regularDaysWithMood.length > 0
    ? regularDaysWithMood.reduce((sum, d) => sum + d.mood!, 0) / regularDaysWithMood.length
    : null;

  // MVD energy average
  const mvdDaysWithEnergy = mvdDays.filter((d) => d.energy !== null);
  const mvdEnergyAvg = mvdDaysWithEnergy.length > 0
    ? mvdDaysWithEnergy.reduce((sum, d) => sum + d.energy!, 0) / mvdDaysWithEnergy.length
    : null;

  // Regular energy average
  const regularDaysWithEnergy = regularDays.filter((d) => d.energy !== null);
  const regularEnergyAvg = regularDaysWithEnergy.length > 0
    ? regularDaysWithEnergy.reduce((sum, d) => sum + d.energy!, 0) / regularDaysWithEnergy.length
    : null;

  // Investment averages
  const mvdInvestmentAvg = mvdDays.length > 0
    ? mvdDays.reduce((sum, d) => sum + d.totalInvestment, 0) / mvdDays.length
    : 0;

  const regularInvestmentAvg = regularDays.length > 0
    ? regularDays.reduce((sum, d) => sum + d.totalInvestment, 0) / regularDays.length
    : 0;

  return {
    mvdMoodAvg,
    regularMoodAvg,
    mvdEnergyAvg,
    regularEnergyAvg,
    mvdInvestmentAvg,
    regularInvestmentAvg,
    mvdCount: mvdDays.length,
    regularCount: regularDays.length,
  };
}

