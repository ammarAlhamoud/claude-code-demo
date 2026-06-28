import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTransactions } from "@/lib/data";

// GET /api/transactions  -> list all transactions (newest first), with category.
// Reuses getTransactions() so this endpoint and the server-rendered pages return
// the same TransactionDTO shape (serialized dates, included category).
export async function GET() {
  return NextResponse.json(await getTransactions());
}

// POST /api/transactions -> create a transaction.
export async function POST(request: Request) {
  const body = await request.json();
  const { amount, type, date, note, categoryId } = body ?? {};

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }
  if (type !== "income" && type !== "expense") {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 }
    );
  }
  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  const parsedDate = date ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "date is invalid" }, { status: 400 });
  }

  const created = await prisma.transaction.create({
    data: {
      amount,
      type,
      categoryId,
      note: note ?? null,
      date: parsedDate,
    },
    include: { category: true },
  });
  return NextResponse.json(created, { status: 201 });
}
