import { db } from "@/db";
import { forms, formFields, formSteps, formVersions } from "@/db/forms-schema";
import { eq, and, isNull } from "drizzle-orm";

export interface FormSnapshot {
  fields: {
    id: string;
    label: string;
    labelNe?: string | null;
    fieldName: string;
    fieldType: string;
    placeholder?: string | null;
    helpText?: string | null;
    isRequired: boolean;
    isHidden: boolean;
    isReadonly: boolean;
    defaultValue?: string | null;
    optionsJson?: unknown;
    validationJson?: unknown;
    conditionalLogicJson?: unknown;
    permissionsJson?: unknown;
    sortOrder: number;
    stepId?: string | null;
  }[];
  steps: {
    id: string;
    title: string;
    titleNe?: string | null;
    description?: string | null;
    stepOrder: number;
  }[];
}

/** Build a snapshot of the current form fields + steps */
export async function buildFormSnapshot(formId: string): Promise<FormSnapshot> {
  const [fields, steps] = await Promise.all([
    db
      .select()
      .from(formFields)
      .where(and(eq(formFields.formId, formId), isNull(formFields.deletedAt)))
      .orderBy(formFields.sortOrder),
    db
      .select()
      .from(formSteps)
      .where(eq(formSteps.formId, formId))
      .orderBy(formSteps.stepOrder),
  ]);

  return { fields, steps };
}

/** Save a new version snapshot and bump the form's currentVersion */
export async function publishFormVersion(
  formId: string,
  createdBy?: string
): Promise<{ versionId: string; version: number }> {
  // Get current version number
  const [form] = await db.select({ cv: forms.currentVersion }).from(forms).where(eq(forms.id, formId));
  const nextVersion = (form?.cv ?? 0) + 1;

  const snapshot = await buildFormSnapshot(formId);

  const [versionRow] = await db
    .insert(formVersions)
    .values({
      formId,
      version: nextVersion,
      snapshotJson: snapshot as unknown as { fields: unknown[]; steps?: unknown[]; metadata?: Record<string, unknown> },
      createdBy: createdBy ?? null,
    } as typeof formVersions.$inferInsert)
    .returning({ id: formVersions.id });

  // Bump currentVersion on the form
  await db.update(forms).set({ currentVersion: nextVersion }).where(eq(forms.id, formId));

  return { versionId: versionRow.id, version: nextVersion };
}
