"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DayEntry, Investment, InvestmentCategory } from "@/lib/types";
import { INVESTMENT_CATEGORIES } from "@/lib/types";
import { saveDayEntry } from "@/app/actions/dayEntry";
import { useDeleteDay } from "@/hooks/useDeleteDay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvestmentCategory as InvestmentCategoryComponent } from "@/components/today/InvestmentCategory";
import { MoodEnergySelector } from "@/components/today/MoodEnergySelector";
import { ReflectionNote } from "@/components/today/ReflectionNote";
import { TagSelector } from "@/components/today/TagSelector";
import { MVDToggle } from "@/components/today/MVDToggle";

interface DayDetailModalProps {
  date: string;
  entry?: DayEntry;
  onClose: () => void;
}

export function DayDetailModal({ date, entry, onClose }: DayDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { deleteDay: deleteDayAction, isPending: isDeletePending } = useDeleteDay({
    onSuccess: () => {
      // Reset local form state to defaults
      setInvestments(
        INVESTMENT_CATEGORIES.map((cat) => ({
          id: `${date}-${cat}`,
          category: cat,
          score: 0,
        }))
      );
      setMood(undefined);
      setEnergy(undefined);
      setNote("");
      setTags([]);
      setIsMinimumViableDay(false);
      onClose();
    },
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [energy, setEnergy] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isMinimumViableDay, setIsMinimumViableDay] = useState(false);

  useEffect(() => {
    if (entry) {
      setInvestments(entry.investments);
      setMood(entry.mood ?? undefined);
      setEnergy(entry.energy ?? undefined);
      setNote(entry.note || "");
      setTags(entry.tags || []);
      setIsMinimumViableDay(entry.isMinimumViableDay || false);
    } else {
      // Initialize with default investments
      setInvestments(
        INVESTMENT_CATEGORIES.map((cat) => ({
          id: `${date}-${cat}`,
          category: cat,
          score: 0,
        }))
      );
      setMood(undefined);
      setEnergy(undefined);
      setNote("");
      setTags([]);
      setIsMinimumViableDay(false);
    }
  }, [entry, date]);

  const handleScoreChange = (category: InvestmentCategory, score: number) => {
    setInvestments((prev) => {
      const existing = prev.find((inv) => inv.category === category);
      if (existing) {
        return prev.map((inv) =>
          inv.category === category ? { ...inv, score } : inv
        );
      } else {
        return [...prev, { id: `${date}-${category}`, category, score }];
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveDayEntry({
          date,
          mood: mood ?? null,
          energy: energy ?? null,
          note: note || null,
          isMinimumViableDay,
          investments: investments.map((inv) => ({
            category: inv.category,
            score: inv.score,
            comment: inv.comment ?? null,
          })),
          tags,
        });
        
        // Refresh router to fetch updated data from server
        router.refresh();
        
        toast.success("Entry saved successfully.");
        onClose();
      } catch (error) {
        toast.error("Failed to save entry. Please try again.");
        console.error(error);
      }
    });
  };

  const handleDeleteDay = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all data for this day? This action cannot be undone."
    );

    if (!confirmed) return;

    deleteDayAction(date);
  };

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investments */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Investments
            </h3>
            {INVESTMENT_CATEGORIES.map((category) => {
              const investment = investments.find(
                (inv) => inv.category === category
              );
              return (
                <InvestmentCategoryComponent
                  key={category}
                  category={category}
                  score={investment?.score || 0}
                  onScoreChange={(score) => handleScoreChange(category, score)}
                />
              );
            })}
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <MoodEnergySelector label="Mood" value={mood} onChange={setMood} />
            <MoodEnergySelector
              label="Energy"
              value={energy}
              onChange={setEnergy}
            />
          </div>

          {/* Reflection */}
          <ReflectionNote value={note} onChange={setNote} />

          {/* Tags */}
          <TagSelector selectedTags={tags} onTagsChange={setTags} />

          {/* MVD Toggle */}
          <MVDToggle
            checked={isMinimumViableDay}
            onCheckedChange={setIsMinimumViableDay}
          />
        </div>

        <DialogFooter className="flex justify-between items-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            onClick={handleDeleteDay}
            disabled={isPending || isDeletePending}
          >
            Delete day
          </button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending || isDeletePending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || isDeletePending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

