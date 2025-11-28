import type { DaySummary, InsightsData, InvestmentCategory } from "./types";
import { CATEGORY_INFO } from "./types";
import { calculateTagAnalytics } from "./insights";

/**
 * Generates a mood-based summary sentence based on average mood levels.
 * 
 * @param days - Array of day summaries
 * @returns Summary sentence or null if no mood data
 */
export function generateMoodSummary(days: DaySummary[]): string | null {
  const daysWithMood = days.filter((d) => d.mood !== null);
  
  if (daysWithMood.length === 0) {
    return null;
  }

  const avgMood = daysWithMood.reduce((sum, d) => sum + d.mood!, 0) / daysWithMood.length;

  if (avgMood >= 4) {
    return "Your mood has been consistently high this period.";
  } else if (avgMood <= 2.5) {
    return "Mood has been lower than usual lately.";
  } else {
    return "Your mood has been balanced this period.";
  }
}

/**
 * Generates an energy-based summary sentence based on average energy levels.
 * 
 * @param days - Array of day summaries
 * @returns Summary sentence or null if no energy data
 */
export function generateEnergySummary(days: DaySummary[]): string | null {
  const daysWithEnergy = days.filter((d) => d.energy !== null);
  
  if (daysWithEnergy.length === 0) {
    return null;
  }

  const avgEnergy = daysWithEnergy.reduce((sum, d) => sum + d.energy!, 0) / daysWithEnergy.length;

  if (avgEnergy >= 4) {
    return "Your energy levels have been strong throughout this period.";
  } else if (avgEnergy <= 2.5) {
    return "Energy has been lower than usual lately—rest may be needed.";
  } else {
    return "Your energy levels have been moderate this period.";
  }
}

/**
 * Generates a category investment summary based on total investment patterns.
 * 
 * @param aggregates - Aggregated insights data
 * @returns Summary sentence or null if no clear pattern
 */
export function generateCategorySummary(
  aggregates: InsightsData["aggregates"]
): string | null {
  if (!aggregates.mostInvestedCategory) {
    return null;
  }

  const categoryTotals = Object.entries(aggregates.categoryAggregates).map(
    ([category, data]) => ({
      category: category as InvestmentCategory,
      total: data.total,
    })
  );

  // Calculate average total
  const avgTotal =
    categoryTotals.reduce((sum, c) => sum + c.total, 0) / categoryTotals.length;

  // Find categories that are significantly higher or lower
  const mostInvested = categoryTotals.find(
    (c) => c.category === aggregates.mostInvestedCategory
  );
  const leastInvested = categoryTotals.find(
    (c) => c.category === aggregates.leastInvestedCategory
  );

  if (!mostInvested) {
    return null;
  }

  // Check if most invested is 30%+ higher than average
  if (mostInvested.total >= avgTotal * 1.3) {
    return `You invested most in ${
      CATEGORY_INFO[mostInvested.category].label
    } this period.`;
  }

  // Check if least invested is 30%+ lower than average (and exists)
  if (leastInvested && leastInvested.total <= avgTotal * 0.7) {
    return `${
      CATEGORY_INFO[leastInvested.category].label
    } received less attention than usual.`;
  }

  return null;
}

/**
 * Generates an MVD summary based on minimum viable day patterns.
 * 
 * @param mvdData - MVD statistics
 * @returns Summary sentence or null if no MVD data
 */
export function generateMvdSummary(mvdData: {
  mvdCount: number;
  totalDays: number;
  mvdPercentage: number;
}): string | null {
  if (mvdData.totalDays === 0) {
    return null;
  }

  if (mvdData.mvdPercentage > 40) {
    return "This was a heavy period with many minimum viable days.";
  } else if (mvdData.mvdPercentage < 10) {
    return "You had very few MVD days—great stability.";
  } else if (mvdData.mvdPercentage >= 10 && mvdData.mvdPercentage <= 40) {
    return "You balanced productive days with self-care.";
  }

  return null;
}

/**
 * Generates a tag-based summary highlighting dominant tags.
 * 
 * @param tagAnalytics - Tag usage analytics
 * @param totalDays - Total days with investment data
 * @returns Summary sentence or null if no clear pattern
 */
export function generateTagSummary(
  tagAnalytics: Array<{ tag: string; count: number }>,
  totalDays: number
): string | null {
  if (tagAnalytics.length === 0 || totalDays === 0) {
    return null;
  }

  const topTag = tagAnalytics[0];
  const topTagPercentage = (topTag.count / totalDays) * 100;

  // Highlight top tag if it appears on 40%+ of days
  if (topTagPercentage >= 40) {
    return `"${topTag.tag}" was your most common tag, appearing on ${Math.round(
      topTagPercentage
    )}% of logged days.`;
  }

  return null;
}

/**
 * Generates a complete narrative summary by combining all rule-based generators.
 * 
 * @param data - Full insights data
 * @returns Array of summary sentences (3-5 sentences)
 */
export function generateNarrativeSummary(data: InsightsData): string[] {
  const summaries: string[] = [];

  // Generate mood summary
  const moodSummary = generateMoodSummary(data.days);
  if (moodSummary) summaries.push(moodSummary);

  // Generate energy summary
  const energySummary = generateEnergySummary(data.days);
  if (energySummary) summaries.push(energySummary);

  // Generate category summary
  const categorySummary = generateCategorySummary(data.aggregates);
  if (categorySummary) summaries.push(categorySummary);

  // Generate MVD summary
  const mvdPercentage =
    data.aggregates.totalDaysLogged > 0
      ? (data.aggregates.mvdCount / data.aggregates.totalDaysLogged) * 100
      : 0;
  const mvdSummary = generateMvdSummary({
    mvdCount: data.aggregates.mvdCount,
    totalDays: data.aggregates.totalDaysLogged,
    mvdPercentage,
  });
  if (mvdSummary) summaries.push(mvdSummary);

  // Generate tag summary
  const tagAnalytics = calculateTagAnalytics(data.days);
  const tagSummary = generateTagSummary(
    tagAnalytics,
    data.aggregates.totalDaysLogged
  );
  if (tagSummary) summaries.push(tagSummary);

  return summaries;
}

