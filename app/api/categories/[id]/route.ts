import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/categories/:id -> update name, color, or monthlyLimit.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.color !== undefined) data.color = body.color;
  if (body.monthlyLimit !== undefined) {
    if (
      body.monthlyLimit !== null &&
      (typeof body.monthlyLimit !== "number" || body.monthlyLimit < 0)
    ) {
      return NextResponse.json(
        { error: "monthlyLimit must be a non-negative number or null" },
        { status: 400 }
      );
    }
    // Only expense categories carry a budget limit (matches POST behaviour).
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "category not found" }, { status: 404 });
    }
    data.monthlyLimit = existing.type === "expense" ? body.monthlyLimit : null;
  }

  try {
    const updated = await prisma.category.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }
}

// DELETE /api/categories/:id -> deletes the category and its transactions (cascade).
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }
}
