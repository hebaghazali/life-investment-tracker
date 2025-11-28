import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDayEntry } from "@/app/actions/dayEntry";
import { DayPageClient } from "./DayPageClient";

interface DayPageProps {
  params: Promise<{
    date: string;
  }>;
}

// Date validation helper
function isValidISODate(dateString: string): boolean {
  // Check format YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date - use UTC to avoid timezone issues
  const date = new Date(dateString + "T00:00:00.000Z");
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify the date components match (prevents invalid dates like 2025-02-30)
  const [year, month, day] = dateString.split("-").map(Number);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function generateMetadata({
  params,
}: DayPageProps): Promise<Metadata> {
  const { date } = await params;

  if (!isValidISODate(date)) {
    return {
      title: "Invalid Date",
    };
  }

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return {
    title: `${formattedDate} - Life Investment Tracker`,
    description: `View your life investments and reflections for ${formattedDate}`,
  };
}

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;

  console.log("DayPage: Accessing date:", date);

  // Validate date format
  if (!isValidISODate(date)) {
    console.log("DayPage: Invalid date format, calling notFound()");
    notFound();
  }

  console.log("DayPage: Date is valid, fetching entry...");

  // Fetch day entry
  let entry;
  try {
    entry = await getDayEntry(date);
    console.log("DayPage: Entry fetched successfully:", !!entry);
  } catch (error) {
    console.error("DayPage: Error fetching day entry:", error);
    // Continue with entry as undefined to show empty state
    entry = undefined;
  }

  console.log("DayPage: Rendering DayPageClient with entry:", !!entry);
  return <DayPageClient date={date} entry={entry || undefined} />;
}

