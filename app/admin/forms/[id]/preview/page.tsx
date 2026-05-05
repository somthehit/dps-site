import { db } from "@/db";
import { forms, formFields, formSteps } from "@/db/forms-schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";

export default async function FormPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [form] = await db.select().from(forms).where(eq(forms.id, id));
  if (!form || form.deletedAt) notFound();

  const [fields, steps] = await Promise.all([
    db.select().from(formFields)
      .where(and(eq(formFields.formId, id), isNull(formFields.deletedAt)))
      .orderBy(asc(formFields.sortOrder)),
    db.select().from(formSteps)
      .where(eq(formSteps.formId, id))
      .orderBy(asc(formSteps.stepOrder)),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Preview banner */}
      <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-4 text-sm font-medium">
        <span>🔍 Admin Preview Mode — This is how members see the form</span>
        <Link href={`/admin/forms/${id}/builder`}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-8 py-8 text-white">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            {form.description && <p className="text-emerald-100 mt-2 text-sm">{form.description}</p>}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {form.category.replace(/_/g, " ").toUpperCase()}
              </span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </span>
              {form.isMultiStep && (
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {steps.length} steps
                </span>
              )}
            </div>
          </div>

          <div className="px-8 py-8">
            <DynamicFormRenderer
              formId={form.id}
              formSlug={form.slug}
              formName={form.name}
              formCategory={form.category}
              isMultiStep={form.isMultiStep}
              fields={fields as Parameters<typeof DynamicFormRenderer>[0]["fields"]}
              steps={steps}
              readOnly={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
