import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formFields } from "@/db/forms-schema";
import { eq, asc, isNull } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string }> };

// GET /api/forms/[id]/fields
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const fields = await db.select().from(formFields)
    .where(eq(formFields.formId, id))
    .orderBy(asc(formFields.sortOrder));
  const active = fields.filter((f) => !f.deletedAt);
  return NextResponse.json({ fields: active });
}

// POST /api/forms/[id]/fields
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      label, labelNe, fieldName, fieldType, placeholder, helpText,
      isRequired, isHidden, isReadonly, defaultValue,
      optionsJson, validationJson, conditionalLogicJson, permissionsJson,
      sortOrder, stepId,
    } = body;

    if (!label || !fieldName || !fieldType) {
      return NextResponse.json({ error: "label, fieldName, fieldType required" }, { status: 400 });
    }

    const [field] = await db.insert(formFields).values({
      formId: id,
      stepId: stepId ?? null,
      label,
      labelNe: labelNe ?? null,
      fieldName,
      fieldType,
      placeholder: placeholder ?? null,
      helpText: helpText ?? null,
      isRequired: isRequired ?? false,
      isHidden: isHidden ?? false,
      isReadonly: isReadonly ?? false,
      defaultValue: defaultValue ?? null,
      optionsJson: optionsJson ?? null,
      validationJson: validationJson ?? null,
      conditionalLogicJson: conditionalLogicJson ?? null,
      permissionsJson: permissionsJson ?? null,
      sortOrder: sortOrder ?? 0,
    }).returning();

    await writeAuditLog({
      entityType: "field", entityId: field.id, action: "field_added",
      after: { formId: id, label, fieldType },
    });

    return NextResponse.json({ field }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
