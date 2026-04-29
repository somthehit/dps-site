import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rawBody = await req.json();

    // Destructure to remove fields that shouldn't be updated and handle dates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt: __, startAt, endAt, ...updateData } = rawBody;

    // Prepare sanitized data
    const sanitizedData: Record<string, unknown> = { ...updateData };

    // Only parse dates if they are valid non-empty strings
    if (startAt && typeof startAt === 'string' && startAt.trim() !== '') {
      sanitizedData.startAt = new Date(startAt);
    } else if (startAt === null || startAt === '') {
      sanitizedData.startAt = null;
    }

    if (endAt && typeof endAt === 'string' && endAt.trim() !== '') {
      sanitizedData.endAt = new Date(endAt);
    } else if (endAt === null || endAt === '') {
      sanitizedData.endAt = null;
    }

    const result = await db.update(heroSlides)
      .set(sanitizedData)
      .where(eq(heroSlides.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: unknown) {
    console.error("PATCH /api/admin/hero-slides/[id] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/hero-slides/[id] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
