import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { asc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/admin/hero-slides Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Parse dates if they exist, or set to null if empty
    if (body.startAt && typeof body.startAt === 'string' && body.startAt.trim() !== '') {
      body.startAt = new Date(body.startAt);
    } else {
      body.startAt = null;
    }

    if (body.endAt && typeof body.endAt === 'string' && body.endAt.trim() !== '') {
      body.endAt = new Date(body.endAt);
    } else {
      body.endAt = null;
    }

    const result = await db.insert(heroSlides).values(body).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    console.error("POST /api/admin/hero-slides Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
