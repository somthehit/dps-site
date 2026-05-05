import { db } from "@/db";
import { formSubmissions, forms, submissionValues, submissionFiles, approvalLogs } from "@/db/forms-schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Download } from "lucide-react";
import { checkAdminAuth } from "@/lib/admin-auth";
import { publicUsers } from "@/db/schema";
import SubmissionActionButtons from "@/components/admin/SubmissionActionButtons";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
  if (!submission) notFound();

  const [form] = await db.select().from(forms).where(eq(forms.id, submission.formId));

  const [values, files, logs] = await Promise.all([
    db.select().from(submissionValues).where(eq(submissionValues.submissionId, id)),
    db.select().from(submissionFiles).where(eq(submissionFiles.submissionId, id)),
    db.select().from(approvalLogs).where(eq(approvalLogs.submissionId, id)).orderBy(desc(approvalLogs.createdAt)),
  ]);

  const snapshot = (submission.schemaSnapshot?.fields as { fieldName: string; label: string }[]) ?? [];
  const valueMap = Object.fromEntries(values.map((v) => [
    v.fieldName,
    v.valueText ?? v.valueJson ?? v.valueNumber ?? (v.valueBoolean !== null ? String(v.valueBoolean) : null)
  ]));

  const isOverdue = submission.dueAt &&
    new Date(submission.dueAt) < new Date() &&
    !["approved", "completed", "rejected"].includes(submission.status);

  const adminUser = await checkAdminAuth();
  let memberEmail = null;
  if (submission.memberId) {
    const [user] = await db.select().from(publicUsers).where(eq(publicUsers.id, submission.memberId));
    memberEmail = user?.email ?? null;
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/submissions" className="p-2 hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 font-mono">{submission.submissionCode}</h1>
                <SubmissionStatus status={submission.status} />
                {isOverdue && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">⚠ OVERDUE</span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {form?.name} · {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleString("ne-NP")
                  : "Draft"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Field values */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Submission Data</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {snapshot.length > 0 ? snapshot.map((field) => {
                  const val = valueMap[field.fieldName];
                  return (
                    <div key={field.fieldName} className="px-6 py-3 flex gap-4">
                      <div className="w-40 shrink-0">
                        <p className="text-xs font-semibold text-slate-500">{field.label}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{field.fieldName}</p>
                      </div>
                      <div className="flex-1">
                        {val !== null && val !== undefined && val !== ""
                          ? <p className="text-sm text-slate-800">
                              {Array.isArray(val) 
                                ? val.join(", ") 
                                : typeof val === "object" 
                                  ? JSON.stringify(val) 
                                  : String(val)}
                            </p>
                          : <p className="text-sm text-slate-400 italic">—</p>}
                      </div>
                    </div>
                  );
                }) : values.map((v) => (
                  <div key={v.id} className="px-6 py-3 flex gap-4">
                    <div className="w-40 shrink-0">
                      <p className="text-xs font-semibold text-slate-500 font-mono">{v.fieldName}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">
                        {v.valueText ?? String(v.valueJson ?? v.valueNumber ?? v.valueBoolean ?? "—")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded files */}
            {files.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Uploaded Files</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {files.map((f) => (
                    <div key={f.id} className="px-6 py-3 flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">📎</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{f.fileName}</p>
                        <p className="text-xs text-slate-400">
                          {f.mimeType} · {(f.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {f.publicUrl && (
                        <a href={f.publicUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Action buttons */}
            {!["approved", "rejected", "completed"].includes(submission.status) && (
              <SubmissionActionButtons 
                id={id} 
                adminId={adminUser.id} 
                memberId={submission.memberId} 
                memberEmail={memberEmail} 
              />
            )}

            {/* Meta info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 text-sm">
              <h3 className="font-bold text-slate-800">Details</h3>
              {[
                { label: "Status", value: <SubmissionStatus status={submission.status} size="sm" /> },
                { label: "Submitted", value: submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("ne-NP") : "—" },
                { label: "Due", value: submission.dueAt ? new Date(submission.dueAt).toLocaleDateString("ne-NP") : "—" },
                { label: "Form", value: form?.name ?? "Unknown" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 shrink-0">{label}</span>
                  <span className="text-right text-slate-700 font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Approval timeline */}
            {logs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Approval Timeline</h3>
                <div className="space-y-3">
                  {logs.map((log) => {
                    const colors: Record<string, string> = {
                      approved: "bg-emerald-500", rejected: "bg-red-500",
                      returned: "bg-amber-500", noted: "bg-blue-500",
                    };
                    return (
                      <div key={log.id} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors[log.action] ?? "bg-slate-400"}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-700 capitalize">{log.action}</p>
                          {log.remarks && <p className="text-xs text-slate-500 mt-0.5">{log.remarks}</p>}
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(log.createdAt!).toLocaleString("ne-NP")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
