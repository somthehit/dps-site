"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Trash2, User, Phone, MapPin, Calendar } from "lucide-react";

type Member = {
  id: string;
  userId: string | null;
  fullName: string;
  phone: string;
  address: string | null;
  isApproved: boolean | null;
  createdAt: Date | null;
};

export default function MembersManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState(initialMembers);

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const toggleApproval = async (id: string, currentStatus: boolean | null) => {
    const newStatus = !currentStatus;
    const res = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ isApproved: newStatus }),
    });

    if (res.ok) {
      const updatedMember = await res.json();
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    const res = await fetch(`/api/members/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": getSecret() },
    });
    if (res.ok) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Member Details</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Contact</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Registered</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{member.fullName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {member.address || "No address"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="text-sm text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {member.phone}
                  </div>
                </td>
                <td className="p-5">
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="p-5">
                  {member.isApproved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleApproval(member.id, member.isApproved)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${member.isApproved ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-green-600 text-white hover:bg-green-700"}`}
                    >
                      {member.isApproved ? "Revoke" : "Approve"}
                    </button>
                    <button 
                      onClick={() => deleteMember(member.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-500">
                  No member applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
