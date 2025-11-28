"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { subDays, isWithinInterval, parseISO } from "date-fns";
import type { InsightsData, TimeRange, InvestmentCategory } from "@/lib/types";
import { CATEGORY_INFO, INVESTMENT_CATEGORIES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodEnergyChart } from "@/components/insights/MoodEnergyChart";
import { CategoryBalanceChart } from "@/components/insights/CategoryBalanceChart";
import { InsightsConsistencySection } from "@/components/insights/InsightsConsistencySection";
import { InsightsMvdSection } from "@/components/insights/InsightsMvdSection";
import { InsightsTagsSection } from "@/components/insights/InsightsTagsSection";

interface InsightsPageClientProps {
  initialData: InsightsData;
  initialRange: TimeRange;
}

export function InsightsPageClient({
  initialData,
  initialRange,
}: InsightsPageClientProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(initialRange);
  const [selectedCategory, setSelectedCategory] = useState<"all" | InvestmentCategory>("all");

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    const today = new Date();
    let rangeStart: Date;

    switch (selectedRange) {
      case "last-7-days":
        rangeStart = subDays(today, 7);
        break;
      case "last-30-days":
        rangeStart = subDays(today, 30);
        break;
      case "last-90-days":
        rangeStart = subDays(today, 90);
        break;
      case "all-time":
        // Use all data
        return initialData;
      default:
        rangeStart = subDays(today, 30);
    }

    // Filter days within the selected range
    const filteredDays = initialData.days.filter((day) => {
      const dayDate = parseISO(day.date);
      return isWithinInterval(dayDate, { start: rangeStart, end: today });
    });

    // Recompute aggregates for filtered days
    const daysWithData = filteredDays.filter((d) => d.totalInvestment > 0);
    const moodValues = filteredDays.filter((d) => d.mood !== null).map((d) => d.mood!);
    const energyValues = filteredDays.filter((d) => d.energy !== null).map((d) => d.energy!);

    const averageMood =
      moodValues.length > 0
        ? moodValues.reduce((sum, m) => sum + m, 0) / moodValues.length
        : null;

    const averageEnergy =
      energyValues.length > 0
        ? energyValues.reduce((sum, e) => sum + e, 0) / energyValues.length
        : null;

    const mvdCount = filteredDays.filter((d) => d.isMinimumViableDay).length;

    // Recompute category aggregates
    const categoryAggregates = {} as typeof initialData.aggregates.categoryAggregates;
    
    INVESTMENT_CATEGORIES.forEach((cat) => {
      const categoryScores = daysWithData.map((d) => d.categoryScores[cat]);
      const total = categoryScores.reduce((sum, score) => sum + score, 0);
      const daysWithCategory = categoryScores.filter((score) => score > 0).length;

      categoryAggregates[cat] = {
        total,
        average: daysWithCategory > 0 ? total / daysWithCategory : 0,
        dayCount: daysWithCategory,
      };
    });

    // Find most and least invested
    let mostInvestedCategory: InvestmentCategory | null = null;
    let leastInvestedCategory: InvestmentCategory | null = null;
    let maxTotal = -1;
    let minTotal = Infinity;

    INVESTMENT_CATEGORIES.forEach((cat) => {
      const total = categoryAggregates[cat].total;
      if (total > maxTotal) {
        maxTotal = total;
        mostInvestedCategory = cat;
      }
      if (total > 0 && total < minTotal) {
        minTotal = total;
        leastInvestedCategory = cat;
      }
    });

    if (maxTotal === 0) {
      mostInvestedCategory = null;
      leastInvestedCategory = null;
    }

    return {
      days: filteredDays,
      aggregates: {
        averageMood,
        averageEnergy,
        totalDaysLogged: daysWithData.length,
        mvdCount,
        categoryAggregates,
        mostInvestedCategory,
        leastInvestedCategory,
      },
      dateRange: {
        from: rangeStart.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
      },
    };
  }, [initialData, selectedRange]);

  // Check data states for UX logic
  const hasAnyData = initialData.aggregates.totalDaysLogged > 0;
  const hasDataInRange = filteredData.aggregates.totalDaysLogged > 0;
  const isLimitedData = hasDataInRange && filteredData.aggregates.totalDaysLogged <= 2;

  // Calculate total days in filtered range
  const totalDaysInRange = filteredData.days.length;

  // Get range label for display
  const getRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "last-7-days":
        return "last 7 days";
      case "last-30-days":
        return "last 30 days";
      case "last-90-days":
        return "last 90 days";
      case "all-time":
        return "all time";
    }
  };

  // No data at all - show centered empty state
  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">
            See patterns in your life investments over time
          </p>
        </div>

        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No insights yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you log a few days in Today or Calendar, you'll start seeing
            patterns here.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/today">Go to Today</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/calendar">Open Calendar</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { aggregates } = filteredData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          See patterns in your life investments over time
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center mr-2">
            Time range:
          </span>
          {(["last-7-days", "last-30-days", "last-90-days", "all-time"] as TimeRange[]).map(
            (range) => (
              <Button
                key={range}
                variant={selectedRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range)}
              >
                {range === "last-7-days" && "7 days"}
                {range === "last-30-days" && "30 days"}
                {range === "last-90-days" && "90 days"}
                {range === "all-time" && "All time"}
              </Button>
            )
          )}
        </div>

        {/* Category Focus Selector */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center mr-2">
            Focus:
          </span>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {INVESTMENT_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_INFO[cat].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Average Mood */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Average Mood</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.averageMood !== null
              ? aggregates.averageMood.toFixed(1)
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            in {getRangeLabel(selectedRange)}
          </div>
        </Card>

        {/* Average Energy */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Average Energy</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.averageEnergy !== null
              ? aggregates.averageEnergy.toFixed(1)
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            in {getRangeLabel(selectedRange)}
          </div>
        </Card>

        {/* Days Logged */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Days Logged</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.totalDaysLogged}
            <span className="text-base text-muted-foreground ml-1">
              / {totalDaysInRange}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalDaysInRange > 0
              ? `${Math.round((aggregates.totalDaysLogged / totalDaysInRange) * 100)}% coverage`
              : ""}
          </div>
        </Card>

        {/* MVD Days */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Minimum Viable Days</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.mvdCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {aggregates.totalDaysLogged > 0
              ? `${Math.round((aggregates.mvdCount / aggregates.totalDaysLogged) * 100)}% of logged days`
              : ""}
          </div>
        </Card>

        {/* Most Invested Category */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Most Invested</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.mostInvestedCategory
              ? CATEGORY_INFO[aggregates.mostInvestedCategory].label
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {aggregates.mostInvestedCategory
              ? `${aggregates.categoryAggregates[aggregates.mostInvestedCategory].total} total points`
              : ""}
          </div>
        </Card>

        {/* Least Invested Category */}
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Least Invested</div>
          <div className="text-3xl font-semibold text-foreground mt-1">
            {aggregates.leastInvestedCategory
              ? CATEGORY_INFO[aggregates.leastInvestedCategory].label
              : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {aggregates.leastInvestedCategory
              ? `${aggregates.categoryAggregates[aggregates.leastInvestedCategory].total} total points`
              : ""}
          </div>
        </Card>
      </div>

      {/* Limited data warning */}
      {isLimitedData && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Insights may be limited with only {filteredData.aggregates.totalDaysLogged}{" "}
            {filteredData.aggregates.totalDaysLogged === 1 ? "day" : "days"} logged
            in this range.
          </p>
        </Card>
      )}

      {/* Data exists but none in current range - show inline empty state */}
      {!hasDataInRange ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No entries found in this period
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your time range to see insights.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setSelectedRange("last-30-days")}
              variant="default"
            >
              Last 30 days
            </Button>
            <Button
              onClick={() => setSelectedRange("all-time")}
              variant="outline"
            >
              All time
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <MoodEnergyChart 
              days={filteredData.days} 
              range={selectedRange} 
            />
            <CategoryBalanceChart
              aggregates={filteredData.aggregates}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Consistency & Streaks Section */}
          <InsightsConsistencySection days={filteredData.days} />

          {/* MVD Insights Section */}
          <InsightsMvdSection days={filteredData.days} />

          {/* Tags Section */}
          <InsightsTagsSection days={filteredData.days} />
        </>
      )}
    </div>
  );
}

