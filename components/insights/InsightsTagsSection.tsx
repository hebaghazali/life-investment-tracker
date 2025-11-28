"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateTagAnalytics } from "@/lib/insights";
import type { DaySummary } from "@/lib/types";

interface InsightsTagsSectionProps {
  days: DaySummary[];
}

export function InsightsTagsSection({ days }: InsightsTagsSectionProps) {
  const tagAnalytics = useMemo(() => calculateTagAnalytics(days), [days]);

  const topThreeTags = tagAnalytics.slice(0, 3);
  const hasData = tagAnalytics.length > 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>

      {!hasData ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No tags used in this period yet.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Tags */}
          {topThreeTags.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-3">
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
        </>
      )}
    </Card>
  );
}

