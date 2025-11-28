"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Investment, InvestmentCategory } from "@/lib/types";

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

export async function saveDayEntry(input: SaveDayEntryInput) {
  const dateObj = new Date(input.date + "T00:00:00.000Z");

  // Check if entry exists
  const existing = await prisma.dayEntry.findUnique({
    where: { date: dateObj },
    include: { investments: true },
  });

  if (existing) {
    // Update existing entry
    await prisma.$transaction(async (tx) => {
      // Delete existing investments
      await tx.investment.deleteMany({
        where: { dayId: existing.id },
      });

      // Update entry with new investments
      await tx.dayEntry.update({
        where: { id: existing.id },
        data: {
          mood: input.mood,
          energy: input.energy,
          note: input.note,
          isMinimumViableDay: input.isMinimumViableDay ?? false,
          tags: JSON.stringify(input.tags),
          investments: {
            create: input.investments.map((inv) => ({
              category: inv.category,
              score: inv.score,
              comment: inv.comment,
            })),
          },
        },
      });
    });
  } else {
    // Create new entry
    await prisma.dayEntry.create({
      data: {
        date: dateObj,
        mood: input.mood,
        energy: input.energy,
        note: input.note,
        isMinimumViableDay: input.isMinimumViableDay ?? false,
        tags: JSON.stringify(input.tags),
        investments: {
          create: input.investments.map((inv) => ({
            category: inv.category,
            score: inv.score,
            comment: inv.comment,
          })),
        },
      },
    });
  }

  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function getDayEntry(date: string) {
  const dateObj = new Date(date + "T00:00:00.000Z");

  const entry = await prisma.dayEntry.findUnique({
    where: { date: dateObj },
    include: { investments: true },
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
      category: inv.category as InvestmentCategory,
      score: inv.score,
      comment: inv.comment,
    })),
    tags: JSON.parse(entry.tags) as string[],
  };
}

export async function getEntriesForMonth(year: number, month: number) {
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const entries = await prisma.dayEntry.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { investments: true },
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
      category: inv.category as InvestmentCategory,
      score: inv.score,
      comment: inv.comment,
    })),
    tags: JSON.parse(entry.tags) as string[],
  }));
}

export async function getAllEntries() {
  const entries = await prisma.dayEntry.findMany({
    include: { investments: true },
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
      category: inv.category as InvestmentCategory,
      score: inv.score,
      comment: inv.comment,
    })),
    tags: JSON.parse(entry.tags) as string[],
  }));
}

export async function clearDayEntry(date: string) {
  const dateObj = new Date(date + "T00:00:00.000Z");

  // Find the entry for this date
  const existing = await prisma.dayEntry.findUnique({
    where: { date: dateObj },
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
}

