"use client";

import { InvestmentCategory as CategoryType, CATEGORY_INFO } from "@/lib/types";

interface InvestmentCategoryProps {
  category: CategoryType;
  score: number;
  onScoreChange: (score: number) => void;
}

export function InvestmentCategory({
  category,
  score,
  onScoreChange,
}: InvestmentCategoryProps) {
  const info = CATEGORY_INFO[category];
  const scores = [0, 1, 2, 3];

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-medium text-foreground md:text-base">{info.label}</h3>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {scores.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onScoreChange(s)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all ${
              score === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

