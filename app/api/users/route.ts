import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemUsers } from "@/db/schema";
import { desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(systemUsers).orderBy(desc(systemUsers.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, Email and Password are required" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.insert(systemUsers).values({
      name,
      email,
      role: role || "staff",
      passwordHash,
      userId: `local_${Date.now()}`, // Fallback unique ID for the schema
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("User Create Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
