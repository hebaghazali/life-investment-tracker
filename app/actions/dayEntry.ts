"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Investment, InvestmentCategory } from "@/lib/types";
import { requireUser } from "@/lib/auth";
import { normalizeDayDate } from "@/lib/dateUtils";

export interface SaveDayEntryInput {
  date: string; // ISO date string "YYYY-MM-DD"
  mood?: number | null;
  energy?: number | null;
  note?: string | null;
  isMinimumViableDay?: boolean;
  investments: {
    category: InvestmentCategory;
    score: number;
    comment?: string | null;
  }[];
  tags: string[];
}

/**
 * Saves or updates a day entry for the authenticated user.
 * 
 * Enforces one entry per user per day via unique constraint on (userId, date).
 * Multiple saves for the same date will update the existing entry.
 * 
 * Assumption: No duplicate (userId, date) rows exist since the unique constraint
 * has been enforced by migration 20251128164524_add_user_id_to_day_entry.
 */
export async function saveDayEntry(input: SaveDayEntryInput) {
  const user = await requireUser();
  const dateObj = normalizeDayDate(input.date);

  // Get category IDs from category names
  const categoryMap = new Map<string, string>();
  const categories = await prisma.investmentCategory.findMany({
    select: { id: true, name: true },
  });
  
  if (categories.length === 0) {
    throw new Error(
      "Investment categories are not set up. Please run database migrations to seed categories."
    );
  }
  
  categories.forEach(cat => categoryMap.set(cat.name, cat.id));

  // Prepare investment data
  const investmentData = input.investments.map((inv) => {
    const categoryId = categoryMap.get(inv.category);
    if (!categoryId) {
      throw new Error(`Category not found: ${inv.category}`);
    }
    return {
      categoryId,
      score: inv.score,
      comment: inv.comment,
    };
  });

  // Use upsert with transaction to handle investments atomically
  await prisma.$transaction(async (tx) => {
    // Delete existing investments first (if entry exists)
    const existing = await tx.dayEntry.findUnique({
      where: { 
        userId_date: {
          userId: user.id,
          date: dateObj,
        }
      },
      select: { id: true }
    });
    
    if (existing) {
      await tx.investment.deleteMany({
        where: { dayId: existing.id },
      });
    }

    // Upsert the entry (create or update atomically)
    await tx.dayEntry.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateObj,
        }
      },
      create: {
        userId: user.id,
        date: dateObj,
        mood: input.mood,
        energy: input.energy,
        note: input.note,
        isMinimumViableDay: input.isMinimumViableDay ?? false,
        tags: JSON.stringify(input.tags),
        investments: {
          create: investmentData,
        },
      },
      update: {
        mood: input.mood,
        energy: input.energy,
        note: input.note,
        isMinimumViableDay: input.isMinimumViableDay ?? false,
        tags: JSON.stringify(input.tags),
        investments: {
          create: investmentData,
        },
      },
    });
  });

  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath(`/day/${input.date}`);
}

export async function getDayEntry(date: string) {
  const user = await requireUser();
  const dateObj = normalizeDayDate(date);

  const entry = await prisma.dayEntry.findUnique({
    where: { 
      userId_date: {
        userId: user.id,
        date: dateObj,
      }
    },
    include: { 
      investments: {
        include: {
          category: true,
        }
      }
    },
  });

  if (!entry) return null;

  return {
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
  };
}

export async function getEntriesForMonth(year: number, month: number) {
  const user = await requireUser();
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const entries = await prisma.dayEntry.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { 
      investments: {
        include: {
          category: true,
        }
      }
    },
    orderBy: { date: "asc" },
  });

  return entries.map((entry) => ({
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
}

export async function getAllEntries() {
  const user = await requireUser();
  const entries = await prisma.dayEntry.findMany({
    where: {
      userId: user.id,
    },
    include: { 
      investments: {
        include: {
          category: true,
        }
      }
    },
    orderBy: { date: "desc" },
  });

  return entries.map((entry) => ({
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
}

export async function clearDayEntry(date: string) {
  const user = await requireUser();
  const dateObj = normalizeDayDate(date);

  // Find the entry for this user and date
  const existing = await prisma.dayEntry.findUnique({
    where: { 
      userId_date: {
        userId: user.id,
        date: dateObj,
      }
    },
  });

  // If entry exists, delete it (cascade will remove investments)
  if (existing) {
    await prisma.dayEntry.delete({
      where: { id: existing.id },
    });
  }

  // Revalidate paths to reflect cleared state
  revalidatePath("/today");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

