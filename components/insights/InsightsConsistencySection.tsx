"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateStreaks } from "@/lib/insights";
import type { DaySummary } from "@/lib/types";

interface InsightsConsistencySectionProps {
  days: DaySummary[];
}

export function InsightsConsistencySection({
  days,
}: InsightsConsistencySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const daysWithAnyInvestment = days.filter((d) => d.totalInvestment > 0).length;
    const totalDaysInRange = days.length;
    const { currentStreak, longestStreak } = calculateStreaks(days);

    return {
      daysWithAnyInvestment,
      totalDaysInRange,
      currentStreak,
      longestStreak,
    };
  }, [days]);

  return (
    <Card className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <h3 className="text-base font-semibold text-foreground md:text-lg">
          Consistency & Streaks
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9 w-9 p-0 md:h-8 md:w-8"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in duration-200 md:space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 md:gap-4">
            {/* Days Logged */}
            <div>
              <div className="mb-1 text-xs text-muted-foreground md:text-sm">Days logged</div>
              <div className="text-xl font-semibold text-foreground md:text-2xl">
                {stats.daysWithAnyInvestment}
                <span className="ml-1 text-sm text-muted-foreground md:text-base">
                  of {stats.totalDaysInRange}
                </span>
              </div>
            </div>

            {/* Current Streak */}
            <div>
              <div className="mb-1 text-xs text-muted-foreground md:text-sm">Current streak</div>
              <div className="text-xl font-semibold text-foreground md:text-2xl">
                {stats.currentStreak}
                <span className="ml-1 text-sm text-muted-foreground md:text-base">days</span>
              </div>
            </div>

            {/* Longest Streak */}
            <div>
              <div className="mb-1 text-xs text-muted-foreground md:text-sm">Longest streak</div>
              <div className="text-xl font-semibold text-foreground md:text-2xl">
                {stats.longestStreak}
                <span className="ml-1 text-sm text-muted-foreground md:text-base">days</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground md:text-sm">
            Consistency is about showing up, not perfection.
          </p>
        </div>
      )}
    </Card>
  );
}

