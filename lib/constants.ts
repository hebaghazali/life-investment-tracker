import type { InvestmentCategory } from "./types";

/**
 * Consistent color mapping for investment categories.
 * Used across all charts and visualizations for category-specific styling.
 */
export const CATEGORY_COLORS: Record<InvestmentCategory, string> = {
  career: "hsl(200, 98%, 39%)", // Blue
  health: "hsl(142, 71%, 45%)", // Green
  relationships: "hsl(280, 65%, 60%)", // Purple
  wellbeing: "hsl(45, 93%, 47%)", // Yellow/Gold
  meaning: "hsl(16, 90%, 55%)", // Orange
  environment: "hsl(174, 72%, 56%)", // Teal
};

/**
 * Demo account email - this account has restricted access to prevent
 * password changes and maintain public accessibility.
 */
export const DEMO_ACCOUNT_EMAIL = "test@example.com";

