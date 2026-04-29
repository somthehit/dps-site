import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { navLinks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(navLinks).orderBy(asc(navLinks.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [row] = await db.insert(navLinks).values(body).returning();
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  const [row] = await db.update(navLinks).set(updates).where(eq(navLinks.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(navLinks).where(eq(navLinks.id, id));
  return NextResponse.json({ ok: true });
}
