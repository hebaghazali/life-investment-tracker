"use client";

import { useState, useTransition } from "react";
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

interface TodayFormProps {
  date: string;
  initialEntry: DayEntry | null;
}

export function TodayForm({ date, initialEntry }: TodayFormProps) {
  const [isPending, startTransition] = useTransition();

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
        toast.success("Today's entry has been saved successfully.");
      } catch (error) {
        toast.error("Failed to save entry. Please try again.");
        console.error(error);
      }
    });
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Investment Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          How did you invest today?
        </h2>
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

