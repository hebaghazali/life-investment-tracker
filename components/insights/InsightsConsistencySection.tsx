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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Consistency & Streaks
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Days Logged */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Days logged</div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.daysWithAnyInvestment}
                <span className="text-base text-muted-foreground ml-1">
                  of {stats.totalDaysInRange}
                </span>
              </div>
            </div>

            {/* Current Streak */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current streak</div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.currentStreak}
                <span className="text-base text-muted-foreground ml-1">days</span>
              </div>
            </div>

            {/* Longest Streak */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Longest streak</div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.longestStreak}
                <span className="text-base text-muted-foreground ml-1">days</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Consistency is about showing up, not perfection.
          </p>
        </div>
      )}
    </Card>
  );
}

