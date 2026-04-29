import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { asc } from "drizzle-orm";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    console.log("POST /api/team body:", body);
    const result = await db.insert(teamMembers).values(body).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    console.error("POST /api/team error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
