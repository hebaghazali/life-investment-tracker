-- Seed Investment Categories
-- These categories are required for the app to function

INSERT INTO "InvestmentCategory" (id, name, "displayName", description, color, icon, "createdAt", "updatedAt")
VALUES
  ('cat_career', 'career', 'Career', 'career, money, skills', '#3b82f6', 'briefcase', NOW(), NOW()),
  ('cat_health', 'health', 'Health', 'physical health', '#10b981', 'heart', NOW(), NOW()),
  ('cat_relationships', 'relationships', 'Relationships', 'family, friends, social', '#f59e0b', 'users', NOW(), NOW()),
  ('cat_wellbeing', 'wellbeing', 'Wellbeing', 'mental/emotional health', '#8b5cf6', 'brain', NOW(), NOW()),
  ('cat_meaning', 'meaning', 'Meaning', 'values, purpose, spirituality', '#ec4899', 'sparkles', NOW(), NOW()),
  ('cat_environment', 'environment', 'Environment', 'order, decluttering, surroundings', '#06b6d4', 'home', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

