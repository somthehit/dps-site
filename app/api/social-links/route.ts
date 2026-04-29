import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [row] = await db.insert(socialLinks).values(body).returning();
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { id: string; platform: string; url?: string; isActive?: boolean; sortOrder?: number };
  const { id, platform, ...updates } = body;
  
  const [row] = await db
    .insert(socialLinks)
    .values({ platform, ...updates })
    .onConflictDoUpdate({
      target: socialLinks.platform,
      set: updates,
    })
    .returning();
    
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
  return NextResponse.json({ ok: true });
}
