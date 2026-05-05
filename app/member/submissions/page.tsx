"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import SubmissionStatus from "@/components/forms/SubmissionStatus";
import { ClipboardList, FileText, LayoutDashboard, Building2, User } from "lucide-react";
import MemberSidebar from "@/components/member/MemberSidebar";

type Sub = {
  id: string;
  submissionCode: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  formName?: string;
  formCategory?: string;
};

const STATUS_FILTERS = ["all", "submitted", "pending", "approved", "rejected", "processing", "completed"];

export default function MemberSubmissionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<{ email: string; fullName?: string } | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('member_user');
    router.push("/login");
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser({
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || "",
        });
        
        const res = await fetch(`/api/submissions?memberId=${authUser.id}&limit=100`);
        const data = await res.json();
        setSubs((data.submissions ?? []).map((s: { submission: Sub; formName: string; formCategory: string }) => ({
          ...s.submission,
          formName: s.formName,
          formCategory: s.formCategory,
        })));
      } else {
        const storedUser = sessionStorage.getItem('member_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {}
        } else {
          router.push("/login");
          return;
        }
      }
      
      setLoading(false);
    };
    init();
  }, []);

  const filtered = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <MemberSidebar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Submissions</h2>
              <p className="text-sm text-slate-500">Track and manage your applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-slate-900">{user?.fullName || "Member"}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-brand-700" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 space-y-6 pb-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Submissions History</h2>
            <p className="text-slate-500 mt-1">मेरा सबमिशनहरूको स्थिति / Track your submission status</p>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => {
              const count = s === "all" ? subs.length : subs.filter((x) => x.status === s).length;
              if (count === 0 && s !== "all") return null;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                    filter === s
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  {s === "all" ? "All" : s} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Submissions list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No submissions found</p>
              <Link href="/member/forms" className="mt-3 inline-block text-sm text-emerald-600 hover:underline font-medium">
                Fill a form →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/member/submissions/${sub.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-bold text-slate-800 text-sm">{sub.submissionCode}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{sub.formName ?? "Form"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <SubmissionStatus status={sub.status} size="sm" />
                    <span className="text-[10px] text-slate-400">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString("ne-NP")
                        : new Date(sub.createdAt).toLocaleDateString("ne-NP")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
