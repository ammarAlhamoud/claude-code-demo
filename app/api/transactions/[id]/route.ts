import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/transactions/:id -> update fields of a transaction.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.amount !== undefined) {
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }
    data.amount = body.amount;
  }
  if (body.type !== undefined) {
    if (body.type !== "income" && body.type !== "expense") {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    data.type = body.type;
  }
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.note !== undefined) data.note = body.note;
  if (body.date !== undefined) data.date = new Date(body.date);

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "transaction not found" }, { status: 404 });
  }
}

// DELETE /api/transactions/:id
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "transaction not found" }, { status: 404 });
  }
}
