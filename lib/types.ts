import { DayEntry, Investment } from "@prisma/client";

export type DayEntryWithInvestments = DayEntry & {
  investments: Investment[];
};

