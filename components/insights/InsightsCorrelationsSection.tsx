"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  computeCategoryMoodCorrelations,
  computeTagMoodEnergyCorrelations,
  computeMvdCorrelations,
} from "@/lib/insights";
import { CATEGORY_INFO } from "@/lib/types";
import type { DaySummary } from "@/lib/types";

interface InsightsCorrelationsSectionProps {
  days: DaySummary[];
}

export function InsightsCorrelationsSection({
  days,
}: InsightsCorrelationsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const correlations = useMemo(() => {
    const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);
    
    // Need at least 5 days with data to compute correlations
    if (daysWithInvestment.length < 5) {
      return null;
    }

    const categoryMoodCorrelations = computeCategoryMoodCorrelations(days);
    const tagCorrelations = computeTagMoodEnergyCorrelations(days);
    const mvdCorrelations = computeMvdCorrelations(days);

    return {
      categoryMoodCorrelations,
      tagCorrelations,
      mvdCorrelations,
    };
  }, [days]);

  const hasData = correlations !== null;

  return (
    <Card className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <h3 className="text-base font-semibold text-foreground md:text-lg">
          Correlations & Patterns
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

      {!hasData ? (
        <div className="py-6 text-center md:py-8">
          <p className="text-xs text-muted-foreground md:text-sm">
            Not enough data to compute correlations for this period. Log a few
            more days to unlock patterns.
          </p>
        </div>
      ) : (
        isExpanded && (
          <div className="space-y-4 animate-in fade-in duration-200 md:space-y-6">
            {/* Category ↔ Mood Patterns */}
            {correlations.categoryMoodCorrelations.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium text-foreground md:mb-3 md:text-sm">
                  Category ↔ Mood Patterns
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
                  {correlations.categoryMoodCorrelations.slice(0, 3).map((corr) => {
                    const isPositive = corr.moodDelta > 0;
                    const deltaSign = isPositive ? "+" : "";
                    return (
                      <Card
                        key={corr.category}
                        className="border-muted bg-muted/30 p-3 md:p-4"
                      >
                        <div className="mb-1 text-xs font-medium text-foreground md:text-sm">
                          {CATEGORY_INFO[corr.category].label} Investment
                        </div>
                        <div
                          className={`mb-1 text-xl font-semibold md:text-2xl ${
                            isPositive ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {deltaSign}
                          {corr.moodDelta.toFixed(1)}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {isPositive
                            ? `Higher ${CATEGORY_INFO[corr.category].label.toLowerCase()} investment days show better mood`
                            : `Lower ${CATEGORY_INFO[corr.category].label.toLowerCase()} investment days show better mood`}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tag ↔ Mood & Energy Patterns */}
            {correlations.tagCorrelations.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium text-foreground md:mb-3 md:text-sm">
                  Tag ↔ Mood & Energy Patterns
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
                  {correlations.tagCorrelations.slice(0, 3).map((corr) => (
                    <Card
                      key={corr.tag}
                      className="border-muted bg-muted/30 p-3 md:p-4"
                    >
                      <div className="mb-1 text-xs font-medium text-foreground md:text-sm">
                        #{corr.tag}
                      </div>
                      <div className="mb-1 flex gap-2 md:gap-3">
                        {corr.moodAverage !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Mood:{" "}
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {corr.moodAverage.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {corr.energyAverage !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Energy:{" "}
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {corr.energyAverage.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used on {corr.dayCount}{" "}
                        {corr.dayCount === 1 ? "day" : "days"}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* MVD vs Non-MVD Patterns */}
            {correlations.mvdCorrelations.mvdCount > 0 &&
              correlations.mvdCorrelations.regularCount > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-medium text-foreground md:mb-3 md:text-sm">
                    MVD vs Non-MVD Patterns
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2 md:gap-3">
                    {/* Mood Comparison */}
                    {correlations.mvdCorrelations.mvdMoodAvg !== null &&
                      correlations.mvdCorrelations.regularMoodAvg !== null && (
                        <Card className="border-muted bg-muted/30 p-3 md:p-4">
                          <div className="mb-2 text-xs font-medium text-foreground md:text-sm">
                            Mood Comparison
                          </div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              MVD days:
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {correlations.mvdCorrelations.mvdMoodAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Regular days:
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {correlations.mvdCorrelations.regularMoodAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        </Card>
                      )}

                    {/* Energy Comparison */}
                    {correlations.mvdCorrelations.mvdEnergyAvg !== null &&
                      correlations.mvdCorrelations.regularEnergyAvg !==
                        null && (
                        <Card className="border-muted bg-muted/30 p-3 md:p-4">
                          <div className="mb-2 text-xs font-medium text-foreground md:text-sm">
                            Energy Comparison
                          </div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              MVD days:
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {correlations.mvdCorrelations.mvdEnergyAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Regular days:
                            </span>
                            <span className="text-base font-semibold text-foreground md:text-lg">
                              {correlations.mvdCorrelations.regularEnergyAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        </Card>
                      )}
                  </div>
                </div>
              )}
          </div>
        )
      )}
    </Card>
  );
}

