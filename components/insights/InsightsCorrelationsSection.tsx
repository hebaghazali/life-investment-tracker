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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Correlations & Patterns
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

      {!hasData ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Not enough data to compute correlations for this period. Log a few
            more days to unlock patterns.
          </p>
        </div>
      ) : (
        isExpanded && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Category ↔ Mood Patterns */}
            {correlations.categoryMoodCorrelations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Category ↔ Mood Patterns
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {correlations.categoryMoodCorrelations.slice(0, 3).map((corr) => {
                    const isPositive = corr.moodDelta > 0;
                    const deltaSign = isPositive ? "+" : "";
                    return (
                      <Card
                        key={corr.category}
                        className="p-4 bg-muted/30 border-muted"
                      >
                        <div className="text-sm font-medium text-foreground mb-1">
                          {CATEGORY_INFO[corr.category].label} Investment
                        </div>
                        <div
                          className={`text-2xl font-semibold mb-1 ${
                            isPositive ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {deltaSign}
                          {corr.moodDelta.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
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
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Tag ↔ Mood & Energy Patterns
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {correlations.tagCorrelations.slice(0, 3).map((corr) => (
                    <Card
                      key={corr.tag}
                      className="p-4 bg-muted/30 border-muted"
                    >
                      <div className="text-sm font-medium text-foreground mb-1">
                        #{corr.tag}
                      </div>
                      <div className="flex gap-3 mb-1">
                        {corr.moodAverage !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Mood:{" "}
                            </span>
                            <span className="text-lg font-semibold text-foreground">
                              {corr.moodAverage.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {corr.energyAverage !== null && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Energy:{" "}
                            </span>
                            <span className="text-lg font-semibold text-foreground">
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
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    MVD vs Non-MVD Patterns
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Mood Comparison */}
                    {correlations.mvdCorrelations.mvdMoodAvg !== null &&
                      correlations.mvdCorrelations.regularMoodAvg !== null && (
                        <Card className="p-4 bg-muted/30 border-muted">
                          <div className="text-sm font-medium text-foreground mb-2">
                            Mood Comparison
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              MVD days:
                            </span>
                            <span className="text-lg font-semibold text-foreground">
                              {correlations.mvdCorrelations.mvdMoodAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Regular days:
                            </span>
                            <span className="text-lg font-semibold text-foreground">
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
                        <Card className="p-4 bg-muted/30 border-muted">
                          <div className="text-sm font-medium text-foreground mb-2">
                            Energy Comparison
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              MVD days:
                            </span>
                            <span className="text-lg font-semibold text-foreground">
                              {correlations.mvdCorrelations.mvdEnergyAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Regular days:
                            </span>
                            <span className="text-lg font-semibold text-foreground">
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

