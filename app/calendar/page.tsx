import { prisma } from "@/lib/prisma";
import { calculateDayIntensity, getIntensityColorClass } from "@/lib/scoring";
import Link from "next/link";

interface CalendarPageProps {
  searchParams: { month?: string; year?: string };
}

async function getMonthEntries(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const entries = await prisma.dayEntry.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      investments: true,
    },
  });

  return entries;
}

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: (Date | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const now = new Date();
  const currentYear = parseInt(searchParams.year || String(now.getFullYear()));
  const currentMonth = parseInt(searchParams.month || String(now.getMonth()));

  const entries = await getMonthEntries(currentYear, currentMonth);
  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  // Create a map of date string to entry for quick lookup
  const entryMap = new Map(
    entries.map((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      return [dateKey, entry];
    })
  );

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  // Navigation helpers
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        <div className="flex items-center justify-between">
          <Link
            href={`/calendar?month=${prevMonth}&year=${prevYear}`}
            className="px-4 py-2 text-zinc-600 hover:text-emerald-600 font-medium transition-colors"
          >
            ← Previous
          </Link>
          <h2 className="text-2xl font-semibold text-zinc-900">{monthName}</h2>
          <Link
            href={`/calendar?month=${nextMonth}&year=${nextYear}`}
            className="px-4 py-2 text-zinc-600 hover:text-emerald-600 font-medium transition-colors"
          >
            Next →
          </Link>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-zinc-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = date.toISOString().split("T")[0];
            const entry = entryMap.get(dateKey);
            const intensity = entry ? calculateDayIntensity(entry) : 0;
            const colorClass = getIntensityColorClass(intensity);

            const isToday =
              date.toDateString() === new Date().toDateString();

            return (
              <div
                key={dateKey}
                className={`aspect-square rounded-lg p-2 transition-all cursor-pointer ${colorClass} ${
                  isToday ? "ring-2 ring-emerald-500" : ""
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="text-right text-sm font-medium text-zinc-800">
                    {date.getDate()}
                  </div>
                  {entry && (
                    <div className="flex-1 flex items-end justify-center">
                      <div className="text-xs text-zinc-700 font-medium">
                        {intensity > 0 && `✓`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <p className="text-sm text-zinc-600 mb-3 font-medium">
            Intensity Legend:
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-zinc-100" />
              <span className="text-sm text-zinc-600">No data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-100" />
              <span className="text-sm text-zinc-600">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-200" />
              <span className="text-sm text-zinc-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-300" />
              <span className="text-sm text-zinc-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-400" />
              <span className="text-sm text-zinc-600">Very High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      {entries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-3">
            Month Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {entries.length}
              </div>
              <div className="text-sm text-zinc-600">Days logged</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-600">
                {entries.filter((e) => e.mood && e.mood >= 4).length}
              </div>
              <div className="text-sm text-zinc-600">High mood days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {Math.round(
                  entries.reduce(
                    (sum, e) => sum + calculateDayIntensity(e),
                    0
                  ) / entries.length
                )}
              </div>
              <div className="text-sm text-zinc-600">Avg intensity</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

