import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(services);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const result = await db.insert(services).values({
      titleEn: body.titleEn,
      titleNe: body.titleNe,
      descEn: body.descEn,
      descNe: body.descNe,
      category: body.category,
      icon: body.icon,
      imageKey: body.imageKey,
      featuresEn: body.featuresEn,
      featuresNe: body.featuresNe,
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
