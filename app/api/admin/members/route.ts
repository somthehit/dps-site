import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db.select().from(members).orderBy(desc(members.createdAt));
    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error("Fetch Members Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const status = body.status || 'pending';
    let memberCode = null;
    let joinDate = null;
    let approvalDate = null;

    if (status === 'active') {
      const [existingCount] = await db.select({ val: count() }).from(members);
      const nextNum = (Number(existingCount?.val) || 0) + 1;
      memberCode = `M-${nextNum.toString().padStart(4, '0')}`;
      joinDate = body.joinDate || new Date().toISOString().split('T')[0];
      approvalDate = new Date();
    }

    const [newMember] = await db.insert(members).values({
      ...body,
      memberCode,
      status,
      joinDate,
      approvalDate,
    }).returning();

    return NextResponse.json(newMember);
  } catch (error: unknown) {
    console.error("Member Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
