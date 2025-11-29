"use client";

import { useState } from "react";
import type { DayEntry } from "@/lib/types";
import { useDeleteDay } from "@/hooks/useDeleteDay";
import { DayCell } from "./DayCell";
import { DayDetailModal } from "./DayDetailModal";
import { DayPreviewDrawer } from "./DayPreviewDrawer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthCalendarProps {
  entries: DayEntry[];
  initialYear: number;
  initialMonth: number;
  onMonthChange: (year: number, month: number) => void;
}

export function MonthCalendar({
  entries,
  initialYear,
  initialMonth,
  onMonthChange,
}: MonthCalendarProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  const goToPreviousMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    onMonthChange(newYear, newMonth);
  };

  const goToNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    onMonthChange(newYear, newMonth);
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const getDateString = (day: number) => {
    return new Date(Date.UTC(currentYear, currentMonth, day)).toISOString().split("T")[0];
  };

  const getEntryForDay = (day: number) => {
    const dateStr = getDateString(day);
    return entries.find((e) => e.date === dateStr);
  };

  // Generate calendar grid
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} />);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const entry = getEntryForDay(day);
    calendarDays.push(
      <DayCell
        key={day}
        day={day}
        entry={entry}
        isToday={isToday(day)}
        onClick={() => {
          const dateStr = getDateString(day);
          setSelectedDate(dateStr);
          setIsPreviewOpen(true);
        }}
      />
    );
  }

  const selectedEntry = selectedDate
    ? entries.find((e) => e.date === selectedDate)
    : undefined;

  const editEntry = editDate
    ? entries.find((e) => e.date === editDate)
    : undefined;

  const handlePreviewEdit = () => {
    setIsPreviewOpen(false);
    setEditDate(selectedDate);
    setIsEditModalOpen(true);
  };

  const { deleteDay } = useDeleteDay({
    onSuccess: () => {
      setIsPreviewOpen(false);
      setSelectedDate(null);
    },
  });

  const handlePreviewDelete = () => {
    if (!selectedDate) return;
    deleteDay(selectedDate);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditDate(null);
    setSelectedDate(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground md:text-2xl">
          {monthName} {currentYear}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center md:gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground md:text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">{calendarDays}</div>

      {/* Day preview drawer */}
      {selectedDate && (
        <DayPreviewDrawer
          date={selectedDate}
          entry={selectedEntry}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedDate(null);
          }}
          onEdit={handlePreviewEdit}
          onDelete={handlePreviewDelete}
        />
      )}

      {/* Day edit modal */}
      {editDate && isEditModalOpen && (
        <DayDetailModal
          date={editDate}
          entry={editEntry}
          onClose={handleEditModalClose}
        />
      )}
    </div>
  );
}

