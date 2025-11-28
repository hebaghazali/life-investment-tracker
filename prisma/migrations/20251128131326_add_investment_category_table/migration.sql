-- CreateTable
CREATE TABLE "InvestmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCategory_name_key" ON "InvestmentCategory"("name");

-- Seed InvestmentCategory table with fixed categories
INSERT INTO "InvestmentCategory" ("id", "name", "displayName", "description", "color", "icon", "createdAt", "updatedAt") VALUES
('cat_career_001', 'career', 'Career', 'Professional development, skills, work projects', '#3B82F6', 'briefcase', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_health_002', 'health', 'Health', 'Physical fitness, nutrition, medical care', '#10B981', 'heart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_relationships_003', 'relationships', 'Relationships', 'Family, friends, social connections', '#F59E0B', 'users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_wellbeing_004', 'wellbeing', 'Well-being', 'Mental health, mindfulness, self-care', '#8B5CF6', 'smile', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_meaning_005', 'meaning', 'Meaning', 'Purpose, values, personal growth', '#EC4899', 'compass', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat_environment_006', 'environment', 'Environment', 'Living space, organization, surroundings', '#06B6D4', 'home', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add categoryId column to Investment table (nullable first)
ALTER TABLE "Investment" ADD COLUMN "categoryId" TEXT;

-- Migrate existing data: map string categories to new category IDs
UPDATE "Investment" 
SET "categoryId" = 'cat_career_001' 
WHERE "category" = 'career';

UPDATE "Investment" 
SET "categoryId" = 'cat_health_002' 
WHERE "category" = 'health';

UPDATE "Investment" 
SET "categoryId" = 'cat_relationships_003' 
WHERE "category" = 'relationships';

UPDATE "Investment" 
SET "categoryId" = 'cat_wellbeing_004' 
WHERE "category" = 'wellbeing';

UPDATE "Investment" 
SET "categoryId" = 'cat_meaning_005' 
WHERE "category" = 'meaning';

UPDATE "Investment" 
SET "categoryId" = 'cat_environment_006' 
WHERE "category" = 'environment';

-- Make categoryId NOT NULL now that all data is migrated
ALTER TABLE "Investment" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop the old category column
ALTER TABLE "Investment" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InvestmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

