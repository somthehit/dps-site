import { db } from "@/db";
import { forms, formFields, formSteps, formSubmissions } from "@/db/forms-schema";
import { eq, asc, isNull, and, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MemberFormFillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [form] = await db.select().from(forms).where(
    and(eq(forms.slug, slug), eq(forms.status, "published"), isNull(forms.deletedAt))
  );
  if (!form) notFound();

  const [fields, steps] = await Promise.all([
    db.select().from(formFields)
      .where(and(eq(formFields.formId, form.id), isNull(formFields.deletedAt)))
      .orderBy(asc(formFields.sortOrder)),
    db.select().from(formSteps)
      .where(eq(formSteps.formId, form.id))
      .orderBy(asc(formSteps.stepOrder)),
  ]);

  // Get member info from server-side Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  if (form.startAt && new Date(form.startAt) > now) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <p className="text-4xl mb-4">📅</p>
          <h2 className="text-xl font-bold text-slate-900">Form Not Yet Open</h2>
          <p className="text-slate-500 mt-2">This form opens on {new Date(form.startAt).toLocaleDateString("ne-NP")}</p>
          <Link href="/member/forms" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">← Back to Forms</Link>
        </div>
      </div>
    );
  }

  if (form.endAt && new Date(form.endAt) < now) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-slate-900">Form Closed</h2>
          <p className="text-slate-500 mt-2">This form closed on {new Date(form.endAt).toLocaleDateString("ne-NP")}</p>
          <Link href="/member/forms" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">← Back to Forms</Link>
        </div>
      </div>
    );
  }

  if (form.submissionLimit) {
    const [res] = await db
      .select({ c: count() })
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, form.id));
    
    if ((res?.c ?? 0) >= form.submissionLimit) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <p className="text-4xl mb-4">🚫</p>
            <h2 className="text-xl font-bold text-slate-900">Submission Limit Reached</h2>
            <p className="text-slate-500 mt-2">This form is no longer accepting new responses.</p>
            <Link href="/member/forms" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">← Back to Forms</Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link href="/member/forms" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Forms
        </Link>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 px-8 py-8 text-white">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            {form.description && (
              <p className="text-emerald-100 text-sm mt-2">{form.description}</p>
            )}
            <div className="flex items-center gap-3 mt-4 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {form.category.replace(/_/g, " ").toUpperCase()}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </span>
              {form.isMultiStep && steps.length > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full">{steps.length} steps</span>
              )}
            </div>
          </div>

          <div className="px-8 py-8">
            {user ? (
              <DynamicFormRenderer
                formId={form.id}
                formSlug={form.slug}
                formName={form.name}
                formCategory={form.category}
                isMultiStep={form.isMultiStep}
                fields={fields as Parameters<typeof DynamicFormRenderer>[0]["fields"]}
                steps={steps}
                memberId={user.id}
                memberEmail={user.email}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Please log in to fill this form.</p>
                <Link href="/login" className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                  Login to Continue
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
