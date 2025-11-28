import { getEntriesForMonth } from "@/app/actions/dayEntry";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const entries = await getEntriesForMonth(year, month);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Your investment journey over time
        </p>
      </div>

      <CalendarClient
        initialEntries={entries}
        initialYear={year}
        initialMonth={month}
      />
    </div>
  );
}

