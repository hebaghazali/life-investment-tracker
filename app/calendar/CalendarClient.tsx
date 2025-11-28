"use client";

import { useState, useTransition } from "react";
import type { DayEntry } from "@/lib/types";
import { getEntriesForMonth } from "@/app/actions/dayEntry";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";

interface CalendarClientProps {
  initialEntries: DayEntry[];
  initialYear: number;
  initialMonth: number;
}

export function CalendarClient({
  initialEntries,
  initialYear,
  initialMonth,
}: CalendarClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (year: number, month: number) => {
    startTransition(async () => {
      const newEntries = await getEntriesForMonth(year, month);
      setEntries(newEntries);
    });
  };

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <MonthCalendar
        entries={entries}
        initialYear={initialYear}
        initialMonth={initialMonth}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}

