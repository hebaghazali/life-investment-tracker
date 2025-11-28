"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DayEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DayKeyMetrics } from "@/components/day/DayKeyMetrics";
import { DayMVDIndicator } from "@/components/day/DayMVDIndicator";
import { DayInvestments } from "@/components/day/DayInvestments";
import { DayTags } from "@/components/day/DayTags";
import { DayReflection } from "@/components/day/DayReflection";
import { DayDetailModal } from "@/components/calendar/DayDetailModal";
import { useDeleteDay } from "@/hooks/useDeleteDay";
import { ChevronLeft } from "lucide-react";

interface DayPageClientProps {
  date: string;
  entry?: DayEntry;
}

export function DayPageClient({ date, entry }: DayPageClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);

  const { deleteDay, isPending: isDeletePending } = useDeleteDay({
    onSuccess: () => {
      // Redirect to calendar after successful deletion
      router.push("/calendar");
    },
  });

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
      deleteDay(date);
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

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  // Empty state - no entry exists
  if (!entry) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/calendar"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Calendar
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {formattedDate}
            </h1>
          </div>

          {/* Empty State */}
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                No entry was recorded for this day
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start tracking your life investments by creating an entry for
                this day.
              </p>
              <div className="pt-4">
                <Button onClick={handleEditClick} size="lg">
                  Create entry
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <DayDetailModal
            date={date}
            entry={entry}
            onClose={handleModalClose}
          />
        )}
      </div>
    );
  }

  // Entry exists - show full day view
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/calendar"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Calendar
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {formattedDate}
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Key Metrics Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Key Metrics
            </h2>
            <DayKeyMetrics entry={entry} totalScore={totalScore} />
          </Card>

          {/* MVD Badge */}
          {entry.isMinimumViableDay && (
            <div>
              <DayMVDIndicator isMinimumViableDay={entry.isMinimumViableDay} />
            </div>
          )}

          {/* Investments Section */}
          <Card className="p-6">
            <DayInvestments entry={entry} />
          </Card>

          {/* Tags Section */}
          {entry.tags && entry.tags.length > 0 && (
            <Card className="p-6">
              <DayTags tags={entry.tags} />
            </Card>
          )}

          {/* Reflection Section */}
          <Card className="p-6">
            <DayReflection note={entry.note} />
          </Card>

          {/* Actions Section */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isDeletePending}
              className={
                showDeleteConfirm
                  ? "flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  : "flex-1"
              }
            >
              {showDeleteConfirm
                ? "Confirm deletion?"
                : isDeletePending
                ? "Deleting..."
                : "Delete day"}
            </Button>
            <Button
              onClick={handleEditClick}
              disabled={isDeletePending}
              className="flex-1"
            >
              Edit day
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <DayDetailModal date={date} entry={entry} onClose={handleModalClose} />
      )}
    </div>
  );
}

