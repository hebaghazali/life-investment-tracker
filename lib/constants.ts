export const INVESTMENT_CATEGORIES = [
  "career",
  "health",
  "relationships",
  "wellbeing",
  "meaning",
  "environment",
] as const;

export type InvestmentCategory = (typeof INVESTMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<InvestmentCategory, string> = {
  career: "Career & Skills",
  health: "Physical Health",
  relationships: "Relationships",
  wellbeing: "Mental Wellbeing",
  meaning: "Purpose & Meaning",
  environment: "Environment & Space",
};

