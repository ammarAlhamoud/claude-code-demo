import { prisma } from "./db";
import type { CategoryDTO, TransactionDTO, TxType } from "./types";

// Server-side data access used by page (server) components. Prisma returns
// Date objects; we serialize dates to ISO strings so the data is safe to pass
// to client components.

export async function getCategories(): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as TxType,
    monthlyLimit: c.monthlyLimit,
    color: c.color,
  }));
}

export async function getTransactions(): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
    include: { category: true },
  });
  return rows.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type as TxType,
    date: t.date.toISOString(),
    note: t.note,
    categoryId: t.categoryId,
    category: {
      id: t.category.id,
      name: t.category.name,
      type: t.category.type as TxType,
      monthlyLimit: t.category.monthlyLimit,
      color: t.category.color,
    },
  }));
}
