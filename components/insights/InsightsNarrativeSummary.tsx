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
      <Card className="w-full max-w-full overflow-x-hidden bg-muted/30 p-4 md:p-6">
        <h3 className="mb-3 text-base font-semibold text-foreground md:text-lg">Summary</h3>
        <p className="text-xs text-muted-foreground md:text-sm">
          Log a few more days to unlock personalized summaries.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full animate-in overflow-x-hidden bg-muted/30 p-4 fade-in duration-300 md:p-6">
      <h3 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Summary</h3>
      <div className="space-y-3">
        {summaries.map((summary, index) => (
          <p
            key={index}
            className="text-xs leading-relaxed text-muted-foreground md:text-sm"
          >
            {summary}
          </p>
        ))}
      </div>
    </Card>
  );
}

