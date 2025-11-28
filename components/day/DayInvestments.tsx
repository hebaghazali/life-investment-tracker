import type { DayEntry } from "@/lib/types";
import { CATEGORY_INFO, INVESTMENT_CATEGORIES } from "@/lib/types";

interface DayInvestmentsProps {
  entry?: DayEntry;
}

function renderScoreIndicator(score: number) {
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
}

export function DayInvestments({ entry }: DayInvestmentsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Investments</h3>
      {INVESTMENT_CATEGORIES.map((category) => {
        const investment = entry?.investments.find(
          (inv) => inv.category === category
        );
        const score = investment?.score || 0;
        const categoryLabel = CATEGORY_INFO[category].label;

        return (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{categoryLabel}</span>
            {renderScoreIndicator(score)}
          </div>
        );
      })}
    </div>
  );
}

