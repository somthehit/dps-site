import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms, formFields, formSteps } from "@/db/forms-schema";
import { eq, isNull, asc } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";
import { publishFormVersion } from "@/lib/forms/snapshot";

type Params = { params: Promise<{ id: string }> };

// GET /api/forms/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [fields, steps] = await Promise.all([
      db.select().from(formFields)
        .where(eq(formFields.formId, id))
        .orderBy(asc(formFields.sortOrder)),
      db.select().from(formSteps)
        .where(eq(formSteps.formId, id))
        .orderBy(asc(formSteps.stepOrder)),
    ]);

    // Exclude soft-deleted fields for public; include for admin (query param)
    const includeDeleted = _req.nextUrl.searchParams.get("includeDeleted") === "1";
    const visibleFields = includeDeleted ? fields : fields.filter((f) => !f.deletedAt);

    return NextResponse.json({ form, fields: visibleFields, steps });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH /api/forms/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [before] = await db.select().from(forms).where(eq(forms.id, id));
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowed = [
      "name", "slug", "description", "category", "status",
      "accessType", "allowedRolesJson", "allowedGroupsJson",
      "isMultiStep", "rateLimitPerMinute", "rateLimitPerDay",
      "startAt", "endAt", "isArchived", "submissionLimit",
    ] as const;

    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) {
        let val = body[key];
        if ((key === "startAt" || key === "endAt") && typeof val === "string") {
          val = val ? new Date(val) : null;
        }
        updates[key] = val;
      }
    }

    // If publishing, create a version snapshot
    if (body.status === "published" && before.status !== "published") {
      await publishFormVersion(id, body.updatedBy);
    }

    const [updated] = await db.update(forms).set(updates as unknown as Partial<typeof forms.$inferInsert>).where(eq(forms.id, id)).returning();

    await writeAuditLog({
      entityType: "form", entityId: id, action: "form_updated",
      before: before as unknown as Record<string, unknown>,
      after: updates,
    });

    return NextResponse.json({ form: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/forms/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [before] = await db.select().from(forms).where(eq(forms.id, id));
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.update(forms).set({ deletedAt: new Date() }).where(eq(forms.id, id));

    await writeAuditLog({
      entityType: "form", entityId: id, action: "form_deleted",
      before: { name: before.name, status: before.status },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
