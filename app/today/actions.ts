"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SaveDayEntryInput {
  date: Date;
  mood: number | null;
  energy: number | null;
  note: string;
  investments: {
    category: string;
    score: number;
    comment: string;
  }[];
}

export async function saveDayEntry(input: SaveDayEntryInput) {
  try {
    // Normalize the date to start of day in local time
    const dateOnly = new Date(input.date);
    dateOnly.setHours(0, 0, 0, 0);

    // Find existing entry for this date
    const existingEntry = await prisma.dayEntry.findUnique({
      where: { date: dateOnly },
      include: { investments: true },
    });

    if (existingEntry) {
      // Update existing entry
      await prisma.dayEntry.update({
        where: { id: existingEntry.id },
        data: {
          mood: input.mood,
          energy: input.energy,
          note: input.note,
          // Delete old investments and create new ones
          investments: {
            deleteMany: {},
            create: input.investments.map((inv) => ({
              category: inv.category,
              score: inv.score,
              comment: inv.comment || null,
            })),
          },
        },
      });
    } else {
      // Create new entry
      await prisma.dayEntry.create({
        data: {
          date: dateOnly,
          mood: input.mood,
          energy: input.energy,
          note: input.note,
          investments: {
            create: input.investments.map((inv) => ({
              category: inv.category,
              score: inv.score,
              comment: inv.comment || null,
            })),
          },
        },
      });
    }

    revalidatePath("/today");
    revalidatePath("/calendar");
    
    return { success: true };
  } catch (error) {
    console.error("Error saving day entry:", error);
    return { success: false, error: "Failed to save entry" };
  }
}

