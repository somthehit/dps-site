import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members, memberRelations, memberDocuments } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Fetch relations and documents
    const [relations, documents] = await Promise.all([
      db.select().from(memberRelations).where(eq(memberRelations.memberId, id)),
      db.select().from(memberDocuments).where(eq(memberDocuments.memberId, id)),
    ]);

    return NextResponse.json({
      ...member,
      relations,
      documents,
    });
  } catch (error: unknown) {
    console.error(`Fetch Member ${id} Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // Approval logic: if status is changing to 'active' and it was 'pending'
    const updateData = { ...body };
    
    if (body.status === 'active') {
      const [existing] = await db.select().from(members).where(eq(members.id, id));
      // If missing approvalDate or previously not active, treat as a fresh approval
      if (existing && (!existing.approvalDate || existing.status !== 'active')) {
        // Generate member code if not exists
        if (!existing.memberCode) {
          const [existingCount] = await db.select({ val: count() }).from(members);
          const nextNum = (Number(existingCount?.val) || 0) + 1;
          updateData.memberCode = `M-${nextNum.toString().padStart(4, '0')}`;
        }
        
        // Set join date if not exists
        if (!existing.joinDate) {
          updateData.joinDate = new Date().toISOString().split('T')[0];
        }
        
        updateData.approvalDate = new Date();
      }
    }

    const [updatedMember] = await db
      .update(members)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    return NextResponse.json(updatedMember);
  } catch (error: unknown) {
    console.error(`Update Member ${id} Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.delete(members).where(eq(members.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error(`Delete Member ${id} Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
