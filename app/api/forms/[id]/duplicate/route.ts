import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms, formFields } from "@/db/forms-schema";
import { eq, isNull, and, asc } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string }> };

// POST /api/forms/[id]/duplicate
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [original] = await db.select().from(forms).where(eq(forms.id, id));
    if (!original) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const fields = await db.select().from(formFields)
      .where(and(eq(formFields.formId, id), isNull(formFields.deletedAt)))
      .orderBy(asc(formFields.sortOrder));

    // Create duplicate with unique slug
    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const [newForm] = await db.insert(forms).values({
      name: `${original.name} (Copy)`,
      slug: newSlug,
      description: original.description,
      category: original.category,
      status: "draft",
      accessType: original.accessType,
      isMultiStep: original.isMultiStep,
      rateLimitPerMinute: original.rateLimitPerMinute,
      rateLimitPerDay: original.rateLimitPerDay,
      allowedRolesJson: original.allowedRolesJson,
      allowedGroupsJson: original.allowedGroupsJson,
    }).returning();

    // Duplicate all fields
    if (fields.length > 0) {
      await db.insert(formFields).values(
        fields.map(({ id: _id, createdAt: _ca, deletedAt: _da, ...rest }) => ({
          ...rest,
          formId: newForm.id,
          stepId: null, // Steps not duplicated in this pass
        }))
      );
    }

    await writeAuditLog({
      entityType: "form", entityId: newForm.id, action: "form_created",
      after: { duplicatedFrom: id, name: newForm.name },
    });

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
