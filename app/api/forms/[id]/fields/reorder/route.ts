import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formFields } from "@/db/forms-schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// POST /api/forms/[id]/fields/reorder
// Body: { order: [{ id: string, sortOrder: number }] }
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const order: { id: string; sortOrder: number }[] = body.order ?? [];

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: "order array required" }, { status: 400 });
    }

    // Batch update sort orders
    await Promise.all(
      order.map(({ id, sortOrder }) =>
        db.update(formFields).set({ sortOrder }).where(eq(formFields.id, id))
      )
    );

    return NextResponse.json({ success: true, updated: order.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
