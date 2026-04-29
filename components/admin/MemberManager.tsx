"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, Search, Filter, 
  Eye, Edit2, Trash2, 
  CheckCircle, XCircle, FileText, UserPlus 
} from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  memberCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  mobileNo: string;
  email: string | null;
  status: string;
  joinDate: string | null;
  memberType: string;
}

export default function MemberManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (m.memberCode?.toLowerCase().includes(search.toLowerCase()) || false) ||
      m.mobileNo.includes(search);
    
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-4 items-center flex-1 w-full">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, code or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 ring-brand-500/5 outline-none transition-all"
              />
           </div>
           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 h-12">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none text-sm font-bold text-slate-600 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Requests</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
              </select>
           </div>
        </div>
        <Link 
          href="/admin/members/new" 
          className="flex items-center gap-2 px-6 h-12 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
        >
          <UserPlus className="w-5 h-5" />
          Add New Member
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Members", value: members.filter(m => m.status === 'active').length, icon: Users, color: "bg-blue-50 text-blue-600" },
           { label: "Pending Requests", value: members.filter(m => m.status === 'pending').length, icon: UserPlus, color: "bg-amber-50 text-amber-600" },
           { label: "Inactive", value: members.filter(m => m.status === 'inactive').length, icon: XCircle, color: "bg-red-50 text-red-600" },
           { label: "Institutional", value: members.filter(m => m.memberType === 'Institutional').length, icon: FileText, color: "bg-slate-50 text-slate-600" },
         ].map((stat) => (
           <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
           </div>
         ))}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Member Code</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Join Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className={`font-mono font-bold px-3 py-1 rounded-lg text-sm ${
                      member.memberCode ? "text-brand-600 bg-brand-50" : "text-amber-600 bg-amber-50"
                    }`}>
                      {member.memberCode || "PENDING"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">{member.firstName} {member.lastName}</div>
                    <div className="text-xs text-slate-400">{member.memberType}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-slate-700">{member.mobileNo}</div>
                    <div className="text-xs text-slate-400">{member.email || "No Email"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-slate-600 font-medium">
                      {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                      member.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      member.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.status === 'pending' && (
                        <button 
                          onClick={async () => {
                            if (confirm(`Approve ${member.firstName}'s membership?`)) {
                              await fetch(`/api/admin/members/${member.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'active' })
                              });
                              fetchMembers();
                            }
                          }}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                          title="Approve Member"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <Link href={`/admin/members/${member.id}`} className="p-2 bg-slate-100 hover:bg-brand-500 hover:text-white rounded-xl transition-all">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/members/${member.id}/edit`} className="p-2 bg-slate-100 hover:bg-violet-500 hover:text-white rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button className="p-2 bg-slate-100 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Users className="w-12 h-12 mb-4" />
                      <p className="font-bold">No members found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
