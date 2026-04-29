"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface MemberActionButtonsProps {
  memberId: string;
  currentStatus: string | null;
}

export default function MemberActionButtons({ memberId, currentStatus }: MemberActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Request failed");
    }
    return res.json();
  };

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      await patch({ status: "active" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    setError(null);
    try {
      await patch({ status: "rejected", rejectionReason: rejectReason.trim() });
      setShowRejectModal(false);
      setRejectReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {error && (
          <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}
        <div className="flex items-center gap-3">
          
          {/* Approve Button: Show if pending or active. Hide if rejected. */}
          {currentStatus !== "rejected" && (
            <button
              onClick={handleApprove}
              disabled={loading !== null || currentStatus === "active"}
              className={`flex items-center gap-2 px-6 h-12 rounded-2xl font-bold transition-all shadow-lg ${
                currentStatus === "active"
                  ? "bg-emerald-100 text-emerald-600 shadow-none cursor-default opacity-80"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 disabled:opacity-50"
              }`}
            >
              {loading === "approve" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {currentStatus === "active" ? "Approved" : "Approve"}
            </button>
          )}

          {/* Reject Button: Show if pending or rejected. Hide if active. */}
          {currentStatus !== "active" && (
            <button
              onClick={() => { setShowRejectModal(true); setError(null); }}
              disabled={loading !== null || currentStatus === "rejected"}
              className={`flex items-center gap-2 px-6 h-12 rounded-2xl font-bold transition-all shadow-lg ${
                currentStatus === "rejected"
                  ? "bg-red-100 text-red-600 shadow-none cursor-default opacity-80"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20 disabled:opacity-50"
              }`}
            >
              <XCircle className="w-5 h-5" />
              {currentStatus === "rejected" ? "Rejected" : "Reject"}
            </button>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Reject Membership</h2>
                <p className="text-sm text-slate-500 mt-0.5">Please provide a reason for rejection.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete documents, invalid citizenship number..."
                rows={4}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-red-500/10 outline-none transition-all resize-none text-sm font-medium text-slate-800"
              />
              {rejectReason.trim() === "" && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Reason is required</p>
              )}
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(""); setError(null); }}
                disabled={loading === "reject"}
                className="flex-1 h-12 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading === "reject" || rejectReason.trim() === ""}
                className="flex-1 h-12 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "reject"
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <XCircle className="w-5 h-5" />
                }
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
