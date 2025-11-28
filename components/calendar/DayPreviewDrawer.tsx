"use client";

import { useState, useEffect } from "react";
import type { DayEntry } from "@/lib/types";
import { CATEGORY_INFO, INVESTMENT_CATEGORIES } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DayPreviewDrawerProps {
  date: string;
  entry?: DayEntry;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DayPreviewDrawer({
  date,
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: DayPreviewDrawerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);

  // Reset delete confirmation when drawer closes or entry changes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      if (deleteTimer) {
        clearTimeout(deleteTimer);
        setDeleteTimer(null);
      }
    }
  }, [isOpen, deleteTimer]);

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const totalScore = entry
    ? entry.investments.reduce((sum, inv) => sum + inv.score, 0)
    : 0;

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      // Second click - execute delete
      onDelete();
      setShowDeleteConfirm(false);
      if (deleteTimer) {
        clearTimeout(deleteTimer);
        setDeleteTimer(null);
      }
    } else {
      // First click - show confirmation
      setShowDeleteConfirm(true);
      const timer = setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteTimer(null);
      }, 3000);
      setDeleteTimer(timer);
    }
  };

  const renderScoreIndicator = (score: number) => {
    return (
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < score ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[380px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{formattedDate}</SheetTitle>
          <SheetDescription>Day overview</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Key Metrics */}
          <div className="flex flex-wrap gap-2">
            {entry?.mood !== null && entry?.mood !== undefined && (
              <Badge variant="secondary" className="text-sm">
                Mood: {entry.mood}/5
              </Badge>
            )}
            {entry?.energy !== null && entry?.energy !== undefined && (
              <Badge variant="secondary" className="text-sm">
                Energy: {entry.energy}/5
              </Badge>
            )}
            <Badge variant="default" className="text-sm bg-primary">
              Total: {totalScore}
            </Badge>
          </div>

          {/* MVD Indicator */}
          {entry?.isMinimumViableDay && (
            <Badge variant="outline" className="w-fit">
              ✓ Minimum Viable Day
            </Badge>
          )}

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Investments
            </h3>
            {INVESTMENT_CATEGORIES.map((category) => {
              const investment = entry?.investments.find(
                (inv) => inv.category === category
              );
              const score = investment?.score || 0;
              const categoryLabel = CATEGORY_INFO[category].label;

              return (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">
                    {categoryLabel}
                  </span>
                  {renderScoreIndicator(score)}
                </div>
              );
            })}
          </div>

          {/* Tags */}
          {entry?.tags && entry.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Reflection
            </h3>
            <Card className="p-3">
              {entry?.note ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {entry.note}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No reflection recorded
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className={
              showDeleteConfirm
                ? "flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                : "flex-1"
            }
            onClick={handleDeleteClick}
          >
            {showDeleteConfirm ? "Confirm deletion?" : "Delete day"}
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            Edit day
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

