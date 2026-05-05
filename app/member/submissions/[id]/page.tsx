import { db } from "@/db";
import { formSubmissions, forms, submissionValues, submissionFiles, approvalLogs } from "@/db/forms-schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import { createClient } from "@/utils/supabase/server";

export default async function MemberSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
  if (!submission) notFound();

  // Security: member can only see own submissions
  if (user && submission.memberId && submission.memberId !== user.id) {
    notFound();
  }

  const [form] = await db.select().from(forms).where(eq(forms.id, submission.formId));

  const [values, files, logs] = await Promise.all([
    db.select().from(submissionValues).where(eq(submissionValues.submissionId, id)),
    db.select().from(submissionFiles).where(eq(submissionFiles.submissionId, id)),
    db.select().from(approvalLogs).where(eq(approvalLogs.submissionId, id)).orderBy(desc(approvalLogs.createdAt)),
  ]);

  const snapshot = (submission.schemaSnapshot?.fields as { fieldName: string; label: string; labelNe?: string }[]) ?? [];
  const valueMap = Object.fromEntries(values.map((v) => [
    v.fieldName,
    v.valueText ?? v.valueJson ?? v.valueNumber ?? (v.valueBoolean !== null ? String(v.valueBoolean) : null)
  ]));

  const ACTION_LABELS: Record<string, string> = {
    approved: "✅ स्वीकृत / Approved",
    rejected: "❌ अस्वीकृत / Rejected",
    returned: "↩ सच्याउन फिर्ता / Returned for Correction",
    noted: "📝 टिप्पणी / Noted",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/member/submissions" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> My Submissions
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-200 text-xs mb-1">Submission ID</p>
                <h1 className="text-2xl font-bold font-mono">{submission.submissionCode}</h1>
                <p className="text-emerald-100 mt-1 text-sm">{form?.name}</p>
              </div>
              <div className="mt-1">
                <SubmissionStatus status={submission.status} />
              </div>
            </div>
          </div>

          {/* Timeline status */}
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { s: "submitted", label: "Submitted" },
                { s: "pending", label: "Review" },
                { s: "approved", label: "Approved" },
              ].map(({ s, label }, i) => {
                const reached = submission.status !== "draft";
                const active = submission.status === s;
                const done = ["approved", "completed"].includes(submission.status) ||
                  (s === "submitted" && ["pending", "approved", "processing", "completed"].includes(submission.status));
                return (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && <div className={`h-px w-8 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      active ? "bg-emerald-600 text-white" :
                      done ? "bg-emerald-100 text-emerald-700" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      {done && !active && "✓ "}{label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field values */}
          <div className="px-8 py-6">
            <h2 className="font-bold text-slate-800 mb-4">तपाईंले भर्नुभएको विवरण / Your Submission</h2>
            <div className="space-y-3">
              {snapshot.length > 0 ? snapshot.map((field) => {
                const val = valueMap[field.fieldName];
                return (
                  <div key={field.fieldName} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-32 shrink-0">
                      <p className="text-xs font-semibold text-slate-600">{field.label}</p>
                      {field.labelNe && <p className="text-[10px] text-slate-400">{field.labelNe}</p>}
                    </div>
                    <div className="flex-1">
                      {val !== null && val !== undefined && val !== ""
                        ? <p className="text-sm text-slate-800">{typeof val === "object" ? JSON.stringify(val) : String(val)}</p>
                        : <p className="text-sm text-slate-400 italic">—</p>}
                    </div>
                  </div>
                );
              }) : values.map((v) => (
                <div key={v.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                  <p className="w-32 text-xs font-semibold text-slate-600 shrink-0 font-mono">{v.fieldName}</p>
                  <p className="text-sm text-slate-800">
                    {v.valueText ?? String(v.valueJson ?? v.valueNumber ?? v.valueBoolean ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">Uploaded Files / अपलोड गरिएका फाइलहरू</h2>
            <div className="space-y-3">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-2xl">📎</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{f.fileName}</p>
                    <p className="text-xs text-slate-400">{(f.sizeBytes / 1024).toFixed(1)} KB</p>
                  </div>
                  {f.publicUrl && (
                    <a href={f.publicUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline font-medium">View</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval timeline */}
        {logs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">निर्णय इतिहास / Decision History</h2>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="w-1 bg-slate-200 rounded-full shrink-0 self-stretch" />
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-sm text-slate-800">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    {log.remarks && (
                      <p className="text-sm text-slate-600 mt-1 p-3 bg-slate-50 rounded-xl">{log.remarks}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(log.createdAt!).toLocaleString("ne-NP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { l: "Submitted", v: submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("ne-NP") : "Draft" },
              { l: "Expected By", v: submission.dueAt ? new Date(submission.dueAt).toLocaleDateString("ne-NP") : "—" },
              { l: "Form", v: form?.name ?? "Unknown" },
              { l: "Category", v: form?.category?.replace(/_/g, " ") ?? "—" },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-xs text-slate-400">{l}</p>
                <p className="font-medium text-slate-700 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
