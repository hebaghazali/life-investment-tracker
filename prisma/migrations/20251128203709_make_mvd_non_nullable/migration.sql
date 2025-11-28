/*
  Warnings:

  - Made the column `isMinimumViableDay` on table `DayEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DayEntry" ALTER COLUMN "isMinimumViableDay" SET NOT NULL;
