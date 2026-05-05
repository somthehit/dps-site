"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";

export default function SubmissionActionButtons({ 
  id, 
  adminId, 
  memberId, 
  memberEmail 
}: { 
  id: string; 
  adminId: string; 
  memberId?: string | null; 
  memberEmail?: string | null; 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "return" | "reject") => {
    let remarks = "";
    if (action === "return" || action === "reject") {
      const input = prompt(`Please enter a reason/remarks to ${action}:`);
      if (input === null) return; // User cancelled
      remarks = input;
    } else {
      if (!confirm(`Are you sure you want to approve this submission?`)) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API expects { adminId, stepId, remarks, reason, memberEmail, memberId }
        body: JSON.stringify({ 
          adminId, 
          memberId, 
          memberEmail, 
          remarks, 
          reason: remarks 
        }) 
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to ${action}: ` + (errorData.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error: " + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
      <h3 className="font-bold text-slate-800 text-sm">Actions</h3>
      <button
        disabled={loading}
        onClick={() => handleAction("approve")}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
      >
        <CheckCircle className="w-4 h-4" /> Approve
      </button>
      <button
        disabled={loading}
        onClick={() => handleAction("return")}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-300 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-50 transition-all disabled:opacity-50"
      >
        <RotateCcw className="w-4 h-4" /> Return for Correction
      </button>
      <button
        disabled={loading}
        onClick={() => handleAction("reject")}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" /> Reject
      </button>
    </div>
  );
}
