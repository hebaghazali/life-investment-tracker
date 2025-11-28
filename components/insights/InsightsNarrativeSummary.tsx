"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { generateNarrativeSummary } from "@/lib/insightsSummary";
import type { InsightsData } from "@/lib/types";

interface InsightsNarrativeSummaryProps {
  data: InsightsData;
}

export function InsightsNarrativeSummary({
  data,
}: InsightsNarrativeSummaryProps) {
  const summaries = useMemo(() => {
    // Need at least 3 logged days to generate meaningful summaries
    if (data.aggregates.totalDaysLogged < 3) {
      return null;
    }

    return generateNarrativeSummary(data);
  }, [data]);

  if (!summaries || summaries.length === 0) {
    return (
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
        <p className="text-sm text-muted-foreground">
          Log a few more days to unlock personalized summaries.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-muted/30 animate-in fade-in duration-300">
      <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
      <div className="space-y-3">
        {summaries.map((summary, index) => (
          <p
            key={index}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {summary}
          </p>
        ))}
      </div>
    </Card>
  );
}

