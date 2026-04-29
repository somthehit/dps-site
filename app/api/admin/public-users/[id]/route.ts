import { db } from "@/db";
import { publicUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(publicUsers).where(eq(publicUsers.id, id));
    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    await db.update(publicUsers).set({ status }).where(eq(publicUsers.id, id));
    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
