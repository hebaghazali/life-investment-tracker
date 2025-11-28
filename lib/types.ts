export type InvestmentCategory =
  | "career"
  | "health"
  | "relationships"
  | "wellbeing"
  | "meaning"
  | "environment";

export interface Investment {
  id: string;
  category: InvestmentCategory;
  score: number; // 0-3
  comment?: string | null;
}

export interface DayEntry {
  id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  mood?: number | null; // 1-5
  energy?: number | null; // 1-5
  note?: string | null;
  isMinimumViableDay: boolean;
  investments: Investment[];
  tags: string[];
}

export const CATEGORY_INFO: Record<
  InvestmentCategory,
  { label: string; description: string }
> = {
  career: { label: "Career", description: "career, money, skills" },
  health: { label: "Health", description: "physical health" },
  relationships: { label: "Relationships", description: "family, friends, social" },
  wellbeing: { label: "Wellbeing", description: "mental/emotional health" },
  meaning: { label: "Meaning", description: "values, purpose, spirituality" },
  environment: {
    label: "Environment",
    description: "order, decluttering, surroundings",
  },
};

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  "career",
  "health",
  "relationships",
  "wellbeing",
  "meaning",
  "environment",
];

export const AVAILABLE_TAGS = [
  "deep-work",
  "social",
  "rest",
  "overwhelmed",
  "creative",
  "focused",
  "distracted",
  "energized",
];

// ============================================================================
// Insights Types
// ============================================================================

export interface DaySummary {
  date: string; // ISO format YYYY-MM-DD
  mood: number | null;
  energy: number | null;
  totalInvestment: number;
  categoryScores: Record<InvestmentCategory, number>;
  isMinimumViableDay: boolean;
  tags: string[];
}

export interface CategoryAggregate {
  total: number;
  average: number;
  dayCount: number;
}

export interface InsightsData {
  days: DaySummary[];
  aggregates: {
    averageMood: number | null;
    averageEnergy: number | null;
    totalDaysLogged: number;
    mvdCount: number;
    categoryAggregates: Record<InvestmentCategory, CategoryAggregate>;
    mostInvestedCategory: InvestmentCategory | null;
    leastInvestedCategory: InvestmentCategory | null;
  };
  dateRange: {
    from: string;
    to: string;
  };
}

export type TimeRange = "last-7-days" | "last-30-days" | "last-90-days" | "all-time";

