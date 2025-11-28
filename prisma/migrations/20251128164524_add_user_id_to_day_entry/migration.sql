-- Step 1: Add userId column as nullable
ALTER TABLE "DayEntry" ADD COLUMN "userId" TEXT;

-- Step 2: Set default userId for existing entries
UPDATE "DayEntry" SET "userId" = 'dev-user' WHERE "userId" IS NULL;

-- Step 3: Make userId non-nullable
ALTER TABLE "DayEntry" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Drop old unique constraint on date
DROP INDEX "DayEntry_date_key";

-- Step 5: Create new compound unique constraint on (userId, date)
CREATE UNIQUE INDEX "DayEntry_userId_date_key" ON "DayEntry"("userId", "date");

