import { NextResponse } from "next/server";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { and, eq, or, isNull, lte, gte, asc } from "drizzle-orm";

export async function GET() {
  const now = new Date();
  
  const rows = await db.select().from(heroSlides)
    .where(
      and(
        eq(heroSlides.isActive, true),
        or(isNull(heroSlides.startAt), lte(heroSlides.startAt, now)),
        or(isNull(heroSlides.endAt), gte(heroSlides.endAt, now))
      )
    )
    .orderBy(asc(heroSlides.sortOrder));
    
  return NextResponse.json(rows);
}
