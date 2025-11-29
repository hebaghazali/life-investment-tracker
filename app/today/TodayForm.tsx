"use client";

import { useState, useTransition, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import type { DayEntry, Investment, InvestmentCategory } from "@/lib/types";
import { INVESTMENT_CATEGORIES } from "@/lib/types";
import { saveDayEntry } from "@/app/actions/dayEntry";
import { InvestmentCategory as InvestmentCategoryComponent } from "@/components/today/InvestmentCategory";
import { MoodEnergySelector } from "@/components/today/MoodEnergySelector";
import { ReflectionNote } from "@/components/today/ReflectionNote";
import { TagSelector } from "@/components/today/TagSelector";
import { MVDToggle } from "@/components/today/MVDToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  saveOfflineEntry,
  removeOfflineEntry,
  getOfflineEntryForDate,
  hasPendingEntryForDate,
} from "@/lib/offlineQueue";
import { WifiOff } from "lucide-react";

interface TodayFormProps {
  date: string;
  initialEntry: DayEntry | null;
}

export function TodayForm({ date, initialEntry }: TodayFormProps) {
  const user = useUser({ or: "return-null" });
  const [isPending, startTransition] = useTransition();
  const [hasPendingSync, setHasPendingSync] = useState(false);

  const [investments, setInvestments] = useState<Investment[]>(() => {
    if (initialEntry?.investments.length) {
      return initialEntry.investments;
    }
    return INVESTMENT_CATEGORIES.map((cat) => ({
      id: `${date}-${cat}`,
      category: cat,
      score: 0,
    }));
  });

  const [mood, setMood] = useState<number | undefined>(
    initialEntry?.mood ?? undefined
  );
  const [energy, setEnergy] = useState<number | undefined>(
    initialEntry?.energy ?? undefined
  );
  const [note, setNote] = useState<string>(initialEntry?.note || "");
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || []);
  const [isMinimumViableDay, setIsMinimumViableDay] = useState(
    initialEntry?.isMinimumViableDay || false
  );

  // Check for pending offline entry on mount and update state
  useEffect(() => {
    if (!user?.id) return;

    const offlineEntry = getOfflineEntryForDate(user.id, date);
    
    if (offlineEntry) {
      // Pre-fill form with offline data
      setMood(offlineEntry.mood ?? undefined);
      setEnergy(offlineEntry.energy ?? undefined);
      setNote(offlineEntry.note || "");
      setTags(offlineEntry.tags);
      setIsMinimumViableDay(offlineEntry.isMinimumViableDay ?? false);
      
      // Set investments from offline data
      const offlineInvestments = offlineEntry.investments.map((inv) => ({
        id: `${date}-${inv.category}`,
        category: inv.category,
        score: inv.score,
        comment: inv.comment,
      }));
      setInvestments(offlineInvestments);
      
      setHasPendingSync(true);
      console.log("[TodayForm] Loaded offline entry for", date);
    }
  }, [user?.id, date]);

  // Re-check pending status when component mounts or date changes
  useEffect(() => {
    if (!user?.id) return;
    setHasPendingSync(hasPendingEntryForDate(user.id, date));
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
        
        toast.success("Today's entry has been saved successfully.");
      } catch (error) {
        console.error("[TodayForm] Failed to save online, storing offline:", error);
        
        // Save to offline queue
        saveOfflineEntry(user.id, payload);
        setHasPendingSync(true);
        
        toast.warning("Saved locally. Will sync when you are back online.");
      }
    });
  };

  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      {/* Investment Categories */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">
            How did you invest today?
          </h2>
          {hasPendingSync && (
            <div className="flex items-center gap-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
              <WifiOff className="h-3.5 w-3.5" />
              Pending sync
            </div>
          )}
        </div>
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
      <div className="grid gap-6 sm:grid-cols-2">
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

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full sm:w-auto"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save Today"}
      </Button>
    </Card>
  );
}

