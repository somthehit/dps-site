import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formFields } from "@/db/forms-schema";
import { eq } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string; fieldId: string }> };

// PATCH /api/forms/[id]/fields/[fieldId]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { fieldId } = await params;
    const body = await request.json();

    const [before] = await db.select().from(formFields).where(eq(formFields.id, fieldId));
    if (!before) return NextResponse.json({ error: "Field not found" }, { status: 404 });

    const allowed = [
      "label", "labelNe", "fieldType", "placeholder", "helpText",
      "isRequired", "isHidden", "isReadonly", "defaultValue",
      "optionsJson", "validationJson", "conditionalLogicJson",
      "permissionsJson", "sortOrder", "stepId",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const [updated] = await db.update(formFields).set(updates as unknown as Partial<typeof formFields.$inferInsert>)
      .where(eq(formFields.id, fieldId)).returning();

    await writeAuditLog({
      entityType: "field", entityId: fieldId, action: "field_updated",
      before: before as unknown as Record<string, unknown>, after: updates,
    });

    return NextResponse.json({ field: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/forms/[id]/fields/[fieldId] — soft delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { fieldId } = await params;
    const [before] = await db.select().from(formFields).where(eq(formFields.id, fieldId));
    if (!before) return NextResponse.json({ error: "Field not found" }, { status: 404 });

    await db.update(formFields).set({ deletedAt: new Date() }).where(eq(formFields.id, fieldId));

    await writeAuditLog({
      entityType: "field", entityId: fieldId, action: "field_deleted",
      before: { label: before.label, fieldType: before.fieldType },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
