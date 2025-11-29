"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DaySummary } from "@/lib/types";

interface InsightsMvdSectionProps {
  days: DaySummary[];
}

export function InsightsMvdSection({ days }: InsightsMvdSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const daysWithInvestment = days.filter((d) => d.totalInvestment > 0);
    const mvdCount = days.filter((d) => d.isMinimumViableDay).length;
    const nonMvdCount = daysWithInvestment.length - mvdCount;
    const mvdPercentage =
      daysWithInvestment.length > 0
        ? (mvdCount / daysWithInvestment.length) * 100
        : 0;

    return {
      mvdCount,
      nonMvdCount,
      daysWithInvestment: daysWithInvestment.length,
      mvdPercentage,
    };
  }, [days]);

  const chartData = [
    { name: "MVD", value: stats.mvdCount, fill: "hsl(var(--chart-2))" },
    { name: "Regular", value: stats.nonMvdCount, fill: "hsl(var(--chart-1))" },
  ];

  const chartConfig = {
    mvd: {
      label: "MVD",
      color: "hsl(var(--chart-2))",
    },
    regular: {
      label: "Regular",
      color: "hsl(var(--chart-1))",
    },
  };

  const hasData = stats.daysWithInvestment > 0;

  return (
    <Card className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <h3 className="text-base font-semibold text-foreground md:text-lg">
          Minimum Viable Days
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
            No logged days in this period yet.
          </p>
        </div>
      ) : (
        isExpanded && (
          <div className="space-y-4 animate-in fade-in duration-200 md:space-y-6">
            {/* Stats Summary */}
            <div>
              <div className="text-xl font-semibold text-foreground md:text-2xl">
                {stats.mvdCount}
                <span className="ml-2 text-sm text-muted-foreground md:text-base">
                  out of {stats.daysWithInvestment} logged days
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stats.mvdPercentage.toFixed(0)}% of logged days were MVDs
              </div>
            </div>

            {/* Chart */}
            <div className="flex w-full max-w-full items-center gap-4 overflow-x-hidden md:gap-6">
              <div className="flex-shrink-0">
                <ChartContainer config={chartConfig} className="h-[120px] w-[120px] md:h-[150px] md:w-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => {
                            return (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">{name}:</span>
                                <span className="font-mono font-medium">{value} days</span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-shrink flex-col gap-2 overflow-hidden">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: "hsl(var(--chart-2))" }}
                  />
                  <span className="text-xs text-muted-foreground md:text-sm">
                    MVD ({stats.mvdCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: "hsl(var(--chart-1))" }}
                  />
                  <span className="text-xs text-muted-foreground md:text-sm">
                    Regular ({stats.nonMvdCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
              Minimum Viable Days are when you mark that you did the minimum to take
              care of yourself. They are not failures; they are part of sustainable
              progress.
            </p>
          </div>
        )
      )}
    </Card>
  );
}

