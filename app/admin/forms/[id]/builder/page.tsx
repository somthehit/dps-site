import { db } from "@/db";
import { forms, formFields, formSteps } from "@/db/forms-schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import BuilderClient from "./BuilderClient";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [form] = await db.select().from(forms).where(eq(forms.id, id));
  if (!form || form.deletedAt) notFound();

  const [fields, steps] = await Promise.all([
    db
      .select()
      .from(formFields)
      .where(and(eq(formFields.formId, id), isNull(formFields.deletedAt)))
      .orderBy(asc(formFields.sortOrder)),
    db
      .select()
      .from(formSteps)
      .where(eq(formSteps.formId, id))
      .orderBy(asc(formSteps.stepOrder)),
  ]);

  return (
    <BuilderClient
      formId={id}
      initialForm={{
        id: form.id,
        name: form.name,
        slug: form.slug,
        status: form.status,
        category: form.category,
        isMultiStep: form.isMultiStep,
        startAt: form.startAt ? form.startAt.toISOString() : null,
        endAt: form.endAt ? form.endAt.toISOString() : null,
        submissionLimit: form.submissionLimit,
      }}
      initialFields={fields as any}
      initialSteps={steps as any}
    />
  );
}
