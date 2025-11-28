"use client";

import { format, parseISO } from "date-fns";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import type { DaySummary, TimeRange } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface MoodEnergyChartProps {
  days: DaySummary[];
  range: TimeRange;
}

export function MoodEnergyChart({ days, range }: MoodEnergyChartProps) {
  // Transform data for the chart
  const chartData = days.map((day) => {
    const date = parseISO(day.date);
    const formattedDate = 
      range === "last-7-days" 
        ? format(date, "EEE") // Mon, Tue, Wed
        : range === "last-30-days"
        ? format(date, "MMM d") // Jan 1, Jan 2
        : format(date, "MMM d"); // Default to MMM d

    return {
      date: formattedDate,
      fullDate: day.date,
      mood: day.mood,
      energy: day.energy,
      mvd: day.isMinimumViableDay,
    };
  });

  // Chart configuration for shadcn Chart component
  const chartConfig = {
    mood: {
      label: "Mood",
      color: "hsl(200, 98%, 39%)", // Blue (primary color)
    },
    energy: {
      label: "Energy",
      color: "hsl(198, 93%, 59%)", // Lighter blue
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Mood & Energy Over Time
      </h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickMargin={8}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12 }}
            tickMargin={8}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div>
                        <div>{format(parseISO(data.fullDate), "MMM d, yyyy")}</div>
                        {data.mvd && (
                          <div className="text-xs text-primary mt-1">
                            ⭐ Minimum Viable Day
                          </div>
                        )}
                      </div>
                    );
                  }
                  return value;
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="var(--color-mood)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="var(--color-energy)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}

