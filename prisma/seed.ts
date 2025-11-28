import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type InvestmentCategory =
  | "career"
  | "health"
  | "relationships"
  | "wellbeing"
  | "meaning"
  | "environment";

const categories: InvestmentCategory[] = [
  "career",
  "health",
  "relationships",
  "wellbeing",
  "meaning",
  "environment",
];

const sampleTags = ["deep-work", "social", "rest", "focused", "creative"];

function randomScore() {
  return Math.floor(Math.random() * 4); // 0-3
}

function randomMood() {
  return Math.floor(Math.random() * 5) + 1; // 1-5
}

function randomEnergy() {
  return Math.floor(Math.random() * 5) + 1; // 1-5
}

async function main() {
  console.log("🌱 Seeding database...");

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayDate = today.getDate();

  // Generate entries for the current month up to today
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let day = 1; day <= Math.min(todayDate, daysInMonth); day++) {
    // Skip some random days to make it more realistic
    if (Math.random() > 0.8) continue;

    const date = new Date(Date.UTC(currentYear, currentMonth, day));

    // Check if entry already exists
    const existing = await prisma.dayEntry.findUnique({
      where: { date },
    });

    if (existing) {
      console.log(`  Skipping ${date.toISOString().split("T")[0]} (exists)`);
      continue;
    }

    const tags =
      Math.random() > 0.5
        ? [sampleTags[Math.floor(Math.random() * sampleTags.length)]]
        : [];

    await prisma.dayEntry.create({
      data: {
        date,
        mood: randomMood(),
        energy: randomEnergy(),
        note:
          Math.random() > 0.5 ? "Sample reflection for this day" : undefined,
        isMinimumViableDay: Math.random() > 0.85,
        tags: JSON.stringify(tags),
        investments: {
          create: categories.map((category) => ({
            category,
            score: randomScore(),
          })),
        },
      },
    });

    console.log(`  Created entry for ${date.toISOString().split("T")[0]}`);
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

