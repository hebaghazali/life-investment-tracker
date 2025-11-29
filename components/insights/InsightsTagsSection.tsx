"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateTagAnalytics } from "@/lib/insights";
import type { DaySummary } from "@/lib/types";

interface InsightsTagsSectionProps {
  days: DaySummary[];
}

export function InsightsTagsSection({ days }: InsightsTagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const tagAnalytics = useMemo(() => calculateTagAnalytics(days), [days]);

  const topThreeTags = tagAnalytics.slice(0, 3);
  const hasData = tagAnalytics.length > 0;

  return (
    <Card className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <h3 className="text-base font-semibold text-foreground md:text-lg">Tags</h3>
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
            No tags used in this period yet.
          </p>
        </div>
      ) : (
        isExpanded && (
          <div className="space-y-4 animate-in fade-in duration-200 md:space-y-6">
            {/* Top 3 Tags */}
            {topThreeTags.length > 0 && (
              <div>
                <div className="mb-2 text-xs text-muted-foreground md:mb-3 md:text-sm">
                  Top 3 tags this period
                </div>
                <div className="flex flex-wrap gap-2">
                  {topThreeTags.map((tag) => (
                    <Badge
                      key={tag.tag}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* All Tags List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tagAnalytics.map((tag) => (
                <div
                  key={tag.tag}
                  className="flex items-start justify-between gap-4 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1">
                      {tag.tag}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tag.count} {tag.count === 1 ? "day" : "days"}
                      {tag.avgMood !== null || tag.avgEnergy !== null ? (
                        <>
                          {" • "}
                          {tag.avgMood !== null && (
                            <>Avg mood {tag.avgMood.toFixed(1)}</>
                          )}
                          {tag.avgMood !== null && tag.avgEnergy !== null && (
                            <>, </>
                          )}
                          {tag.avgEnergy !== null && (
                            <>energy {tag.avgEnergy.toFixed(1)}</>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </Card>
  );
}

