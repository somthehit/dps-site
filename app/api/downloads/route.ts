import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { downloads } from "@/db/schema";
import { desc } from "drizzle-orm";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(downloads).orderBy(desc(downloads.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const result = await db.insert(downloads).values(body).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
