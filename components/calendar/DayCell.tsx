"use client";

import type { DayEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface DayCellProps {
  day: number;
  entry?: DayEntry;
  isToday: boolean;
  onClick: () => void;
}

export function DayCell({ day, entry, isToday, onClick }: DayCellProps) {
  const getIntensity = (entry?: DayEntry): string => {
    if (!entry) return "bg-intensity-none";

    const totalScore = entry.investments.reduce((sum, inv) => sum + inv.score, 0);

    if (totalScore === 0) return "bg-intensity-none";
    if (totalScore <= 6) return "bg-intensity-low";
    if (totalScore <= 12) return "bg-intensity-medium";
    return "bg-intensity-high";
  };

  const intensity = getIntensity(entry);

  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-md ${
        isToday ? "border-primary" : "border-border"
      } ${intensity}`}
    >
      <div className="flex h-full flex-col items-start justify-between">
        <span
          className={`text-sm font-medium ${
            isToday ? "text-primary" : "text-foreground"
          }`}
        >
          {day}
        </span>
        {entry?.isMinimumViableDay && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            MVD
          </Badge>
        )}
      </div>
    </button>
  );
}

