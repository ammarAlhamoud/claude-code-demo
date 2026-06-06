import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/categories -> list all categories.
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

// POST /api/categories -> create a category.
export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, color, monthlyLimit } = body ?? {};

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (type !== "income" && type !== "expense") {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 }
    );
  }
  if (monthlyLimit !== undefined && monthlyLimit !== null) {
    if (typeof monthlyLimit !== "number" || monthlyLimit < 0) {
      return NextResponse.json(
        { error: "monthlyLimit must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  const created = await prisma.category.create({
    data: {
      name,
      type,
      color: color ?? "#64748b",
      monthlyLimit: type === "expense" ? monthlyLimit ?? null : null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
