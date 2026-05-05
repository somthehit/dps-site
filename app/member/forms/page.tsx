"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FileText, ClipboardList, ArrowRight, Clock, LogOut, LayoutDashboard, User, Building2 } from "lucide-react";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import MemberSidebar from "@/components/member/MemberSidebar";

type Form = { id: string; name: string; slug: string; category: string; description?: string | null };
type Sub = { id: string; submissionCode: string; status: string; submittedAt: string | null; formName?: string };

export default function MemberFormsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('member_user');
    router.push("/login");
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let currentUserId = user?.id || null;
      let currentUserEmail = user?.email || null;
      let currentFullName = user?.user_metadata?.full_name || null;

      // Fallback to session storage for unconfirmed emails
      if (!currentUserId && typeof window !== "undefined") {
        const stored = sessionStorage.getItem("member_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            currentUserEmail = parsed.email;
            currentFullName = parsed.fullName;
          } catch (e) {}
        }
      }

      setMemberId(currentUserId);
      setMemberEmail(currentUserEmail);
      setFullName(currentFullName);

      // 1. Fetch public forms (no auth required)
      const formsRes = await fetch("/api/forms?public=1");
      const formsData = await formsRes.json();
      setForms(formsData.forms ?? []);

      // 2. Fetch submissions only if logged in
      if (user) {
        const subsRes = await fetch(`/api/submissions?memberId=${user.id}&limit=10`);
        const subsData = await subsRes.json();
        setSubmissions((subsData.submissions ?? []).map((s: { submission: Sub; formName: string }) => ({
          ...s.submission,
          formName: s.formName,
        })));
      }
      
      setLoading(false);
    };
    init();
  }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    loan: "bg-blue-50 text-blue-600",
    savings: "bg-emerald-50 text-emerald-600",
    fertilizer: "bg-lime-50 text-lime-700",
    member_services: "bg-violet-50 text-violet-600",
    complaint: "bg-red-50 text-red-600",
    hr: "bg-slate-50 text-slate-600",
    share: "bg-amber-50 text-amber-600",
    custom: "bg-teal-50 text-teal-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading forms…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <MemberSidebar onLogout={handleLogout} />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Online Forms</h2>
              <p className="text-sm text-slate-500">Apply for services and track your applications</p>
            </div>
            <div className="flex items-center gap-4">
              {memberId ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-slate-900">{fullName || "Member"}</p>
                    <p className="text-sm text-slate-500">{memberEmail}</p>
                  </div>
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-700" />
                  </div>
                </>
              ) : (
                <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 space-y-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Available Forms</h2>
              <p className="text-slate-500 mt-1">फाराम भर्न यहाँ क्लिक गर्नुहोस् / Click a form to fill it out</p>
            </div>
          </div>

          {/* Available forms */}
          {forms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No forms available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/member/forms/${form.slug}`}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLORS[form.category] ?? "bg-slate-50 text-slate-500"}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {form.name}
                      </h3>
                      {form.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{form.description}</p>
                      )}
                      <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {form.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent submissions */}
          {submissions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
                <Link href="/member/submissions" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                  View all →
                </Link>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {submissions.map((sub) => (
                    <Link key={sub.id} href={`/member/submissions/${sub.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="font-mono text-sm font-bold text-slate-700 w-36 shrink-0">{sub.submissionCode}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 truncate">{sub.formName ?? "Form"}</p>
                      </div>
                      <SubmissionStatus status={sub.status} size="sm" />
                      <div className="text-xs text-slate-400 shrink-0">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("ne-NP") : "Draft"}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
