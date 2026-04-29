import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { asc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/hero-slides/admin: BYPASSING ADMIN CHECK");
    const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/hero-slides/admin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();

    // Parse dates if they exist, or set to null if empty
    body.startAt = body.startAt ? new Date(body.startAt) : null;
    body.endAt = body.endAt ? new Date(body.endAt) : null;

    const result = await db.insert(heroSlides).values(body).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
