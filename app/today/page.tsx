import { prisma } from "@/lib/prisma";
import { INVESTMENT_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import TodayForm from "./TodayForm";

async function getTodayEntry() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entry = await prisma.dayEntry.findUnique({
    where: { date: today },
    include: { investments: true },
  });

  return entry;
}

export default async function TodayPage() {
  const entry = await getTodayEntry();

  // Convert entry to a plain object that can be serialized
  const initialData = entry
    ? {
        mood: entry.mood,
        energy: entry.energy,
        note: entry.note || "",
        investments: INVESTMENT_CATEGORIES.map((category) => {
          const existingInv = entry.investments.find(
            (inv) => inv.category === category
          );
          return {
            category,
            score: existingInv?.score || 0,
            comment: existingInv?.comment || "",
          };
        }),
      }
    : {
        mood: null,
        energy: null,
        note: "",
        investments: INVESTMENT_CATEGORIES.map((category) => ({
          category,
          score: 0,
          comment: "",
        })),
      };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Today</h2>
        <p className="text-zinc-600">{formattedDate}</p>
      </div>

      <TodayForm initialData={initialData} />
    </div>
  );
}

