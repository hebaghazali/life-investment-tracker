"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
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
import {
  saveOfflineEntry,
  removeOfflineEntry,
  getOfflineEntryForDate,
  hasPendingEntryForDate,
} from "@/lib/offlineQueue";
import { WifiOff } from "lucide-react";

interface DayDetailModalProps {
  date: string;
  entry?: DayEntry;
  onClose: () => void;
}

export function DayDetailModal({ date, entry, onClose }: DayDetailModalProps) {
  const router = useRouter();
  const user = useUser({ or: "return-null" });
  const [isPending, startTransition] = useTransition();
  const [hasPendingSync, setHasPendingSync] = useState(false);
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
    if (!user?.id) return;

    // First check for pending offline entry - it takes priority
    const offlineEntry = getOfflineEntryForDate(user.id, date);
    
    if (offlineEntry) {
      // Pre-fill form with offline data (latest source of truth)
      setMood(offlineEntry.mood ?? undefined);
      setEnergy(offlineEntry.energy ?? undefined);
      setNote(offlineEntry.note || "");
      setTags(offlineEntry.tags);
      setIsMinimumViableDay(offlineEntry.isMinimumViableDay ?? false);
      
      const offlineInvestments = offlineEntry.investments.map((inv) => ({
        id: `${date}-${inv.category}`,
        category: inv.category,
        score: inv.score,
        comment: inv.comment,
      }));
      setInvestments(offlineInvestments);
      
      setHasPendingSync(true);
      console.log("[DayDetailModal] Loaded offline entry for", date);
    } else if (entry) {
      // Use server entry if no offline version exists
      setInvestments(entry.investments);
      setMood(entry.mood ?? undefined);
      setEnergy(entry.energy ?? undefined);
      setNote(entry.note || "");
      setTags(entry.tags || []);
      setIsMinimumViableDay(entry.isMinimumViableDay || false);
      setHasPendingSync(false);
    } else {
      // Initialize with defaults for new entry
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
      setHasPendingSync(false);
    }
  }, [entry, date, user?.id]);

  // Re-check pending status
  useEffect(() => {
    if (!user?.id) return;
    const isPending = hasPendingEntryForDate(user.id, date);
    setHasPendingSync(isPending);
  }, [user?.id, date]);

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
    if (!user?.id) return;

    startTransition(async () => {
      const payload = {
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
      };

      try {
        await saveDayEntry(payload);
        
        // Remove from offline queue on successful save
        removeOfflineEntry(user.id, date);
        setHasPendingSync(false);
        
        // Refresh router to fetch updated data from server
        router.refresh();
        
        toast.success("Entry saved successfully.");
        onClose();
      } catch (error) {
        console.error("[DayDetailModal] Failed to save online, storing offline:", error);
        
        // Save to offline queue
        saveOfflineEntry(user.id, payload);
        setHasPendingSync(true);
        
        toast.warning("Saved locally. Will sync when you are back online.");
        // Don't close modal - user can see the pending sync indicator
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
          <div className="flex items-center gap-3">
            <DialogTitle>{formattedDate}</DialogTitle>
            {hasPendingSync && (
              <div className="flex items-center gap-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                <WifiOff className="h-3.5 w-3.5" />
                Pending sync
              </div>
            )}
          </div>
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

