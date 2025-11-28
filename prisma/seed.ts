import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// User ID from Neon Auth (test@example.com)
const SEED_USER_ID = "1448b708-0c7a-4ea5-8f8e-7390cce6e3c5";

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

  // Fetch investment categories from database
  const categories = await prisma.investmentCategory.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    console.error("❌ No investment categories found in database!");
    console.log("Please ensure the migration has been run to seed categories.");
    process.exit(1);
  }

  console.log(`📊 Found ${categories.length} investment categories`);

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

    // Check if entry already exists for test user
    const existing = await prisma.dayEntry.findUnique({
      where: { 
        userId_date: {
          userId: SEED_USER_ID,
          date,
        }
      },
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
        userId: SEED_USER_ID,
        date,
        mood: randomMood(),
        energy: randomEnergy(),
        note:
          Math.random() > 0.5 ? "Sample reflection for this day" : undefined,
        isMinimumViableDay: Math.random() > 0.85,
        tags: JSON.stringify(tags),
        investments: {
          create: categories.map((category) => ({
            categoryId: category.id,
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

