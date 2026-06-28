import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Reset so the seed is idempotent.
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Salary", type: "income", color: "#16a34a", monthlyLimit: null },
    }),
    prisma.category.create({
      data: { name: "Freelance", type: "income", color: "#22c55e", monthlyLimit: null },
    }),
    prisma.category.create({
      data: { name: "Rent", type: "expense", color: "#ef4444", monthlyLimit: 1500 },
    }),
    prisma.category.create({
      data: { name: "Groceries", type: "expense", color: "#f97316", monthlyLimit: 600 },
    }),
    prisma.category.create({
      data: { name: "Dining Out", type: "expense", color: "#eab308", monthlyLimit: 300 },
    }),
    prisma.category.create({
      data: { name: "Transport", type: "expense", color: "#3b82f6", monthlyLimit: 200 },
    }),
    prisma.category.create({
      data: { name: "Entertainment", type: "expense", color: "#a855f7", monthlyLimit: 150 },
    }),
    prisma.category.create({
      data: { name: "Utilities", type: "expense", color: "#06b6d4", monthlyLimit: 250 },
    }),
  ]);

  const byName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const now = new Date();
  // Generate a few months of sample transactions.
  const samples: { name: string; amount: number; monthsAgo: number; day: number; type: "income" | "expense" }[] = [];

  for (let m = 0; m < 3; m++) {
    samples.push(
      { name: "Salary", amount: 4200, monthsAgo: m, day: 1, type: "income" },
      { name: "Freelance", amount: 600 + m * 50, monthsAgo: m, day: 12, type: "income" },
      { name: "Rent", amount: 1500, monthsAgo: m, day: 3, type: "expense" },
      { name: "Groceries", amount: 180 + m * 30, monthsAgo: m, day: 6, type: "expense" },
      { name: "Groceries", amount: 150, monthsAgo: m, day: 20, type: "expense" },
      { name: "Dining Out", amount: 90 + m * 40, monthsAgo: m, day: 9, type: "expense" },
      { name: "Transport", amount: 120, monthsAgo: m, day: 15, type: "expense" },
      { name: "Entertainment", amount: 60 + m * 20, monthsAgo: m, day: 18, type: "expense" },
      { name: "Utilities", amount: 210, monthsAgo: m, day: 22, type: "expense" }
    );
  }

  await prisma.transaction.createMany({
    data: samples.map((s) => ({
      amount: s.amount,
      type: s.type,
      categoryId: byName[s.name].id,
      date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - s.monthsAgo, s.day)),
      note: null,
    })),
  });

  console.log(
    `Seeded ${categories.length} categories and ${samples.length} transactions.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
