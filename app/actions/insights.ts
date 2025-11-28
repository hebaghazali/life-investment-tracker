"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { buildInsightsFromEntries } from "@/lib/insights";
import type { InvestmentCategory, InsightsData } from "@/lib/types";

/**
 * Fetches and aggregates insights data for the authenticated user within a date range.
 * 
 * @param range - Date range to fetch data for
 * @returns InsightsData containing days and aggregates
 */
export async function getInsightsData(range: {
  from: Date;
  to: Date;
}): Promise<InsightsData> {
  const user = await requireUser();

  // Fetch all day entries with investments for the user in the date range
  const entries = await prisma.dayEntry.findMany({
    where: {
      userId: user.id,
      date: {
        gte: range.from,
        lte: range.to,
      },
    },
    include: {
      investments: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Transform database entries to DayEntry type
  const dayEntries = entries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString().split("T")[0],
    mood: entry.mood,
    energy: entry.energy,
    note: entry.note,
    isMinimumViableDay: entry.isMinimumViableDay,
    investments: entry.investments.map((inv) => ({
      id: inv.id,
      category: inv.category.name as InvestmentCategory,
      score: inv.score,
      comment: inv.comment,
    })),
    tags: JSON.parse(entry.tags) as string[],
  }));

  // Build and return insights data
  return buildInsightsFromEntries(dayEntries, range);
}

