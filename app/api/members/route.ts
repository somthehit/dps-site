import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { desc } from "drizzle-orm";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await db.select().from(members).orderBy(desc(members.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Members API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
