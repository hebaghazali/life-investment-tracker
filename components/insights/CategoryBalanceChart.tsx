"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { InsightsData, InvestmentCategory } from "@/lib/types";
import { CATEGORY_INFO, INVESTMENT_CATEGORIES } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CategoryBalanceChartProps {
  aggregates: InsightsData["aggregates"];
  selectedCategory: "all" | InvestmentCategory;
}

export function CategoryBalanceChart({
  aggregates,
  selectedCategory,
}: CategoryBalanceChartProps) {
  // Transform data for the chart
  const chartData = INVESTMENT_CATEGORIES.map((cat) => {
    const isSelected = selectedCategory === "all" || selectedCategory === cat;
    
    return {
      category: CATEGORY_INFO[cat].label,
      categoryKey: cat,
      total: aggregates.categoryAggregates[cat].total,
      average: aggregates.categoryAggregates[cat].average,
      fill: CATEGORY_COLORS[cat],
      opacity: isSelected ? 1 : 0.3,
    };
  });

  // Create chart config dynamically from categories
  const chartConfig = INVESTMENT_CATEGORIES.reduce(
    (config, cat) => ({
      ...config,
      [cat]: {
        label: CATEGORY_INFO[cat].label,
        color: CATEGORY_COLORS[cat],
      },
    }),
    {} as Record<string, { label: string; color: string }>
  );

  return (
    <Card className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      <h3 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">
        Investment by Category
      </h3>
      <div className="w-full max-w-full">
        <ChartContainer config={chartConfig} className="h-[220px] w-full md:h-[300px]">
          <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 9 }}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={70}
            className="md:text-xs"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickMargin={8}
            label={{ value: 'Total Score', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            className="md:text-xs"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono font-medium">{data.total}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Average:</span>
                        <span className="font-mono font-medium">
                          {data.average > 0 ? data.average.toFixed(1) : "0"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Days:</span>
                        <span className="font-mono font-medium">
                          {aggregates.categoryAggregates[data.categoryKey as InvestmentCategory].dayCount}
                        </span>
                      </div>
                    </div>
                  );
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.category;
                  }
                  return value;
                }}
              />
            }
          />
          <Bar
            dataKey="total"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <rect
                key={`cell-${index}`}
                fill={entry.fill}
                opacity={entry.opacity}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      </div>
    </Card>
  );
}

