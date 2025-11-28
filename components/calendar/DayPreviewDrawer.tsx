"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DayEntry } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DayKeyMetrics } from "@/components/day/DayKeyMetrics";
import { DayMVDIndicator } from "@/components/day/DayMVDIndicator";
import { DayInvestments } from "@/components/day/DayInvestments";
import { DayTags } from "@/components/day/DayTags";
import { DayReflection } from "@/components/day/DayReflection";

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[380px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{formattedDate}</SheetTitle>
          <SheetDescription>
            Day overview •{" "}
            <Link
              href={`/day/${date}`}
              className="text-primary hover:underline"
              onClick={onClose}
            >
              Open full view
            </Link>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Key Metrics */}
          <DayKeyMetrics entry={entry} totalScore={totalScore} />

          {/* MVD Indicator */}
          <DayMVDIndicator isMinimumViableDay={entry?.isMinimumViableDay} />

          {/* Category Breakdown */}
          <DayInvestments entry={entry} />

          {/* Tags */}
          <DayTags tags={entry?.tags} />

          {/* Reflection */}
          <DayReflection note={entry?.note} />
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

