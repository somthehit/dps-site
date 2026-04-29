"use client";

import { useEffect, useState } from "react";
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Eye, 
  Trash2, 
  Loader2,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type PublicUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  citizenship_no: string;
  citizenship_front_url: string;
  citizenship_back_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function PublicUsersManager() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/public-users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    try {
      await fetch(`/api/admin/public-users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await fetch(`/api/admin/public-users/${id}`, { method: "DELETE" });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Registration Applications</h2>
          <p className="text-slate-500">Review and approve new member applications ({users.length} total)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
          {users.map((user) => (
            <div 
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedUser?.id === user.id 
                ? "bg-brand-50 border-brand-200 shadow-sm" 
                : "bg-white border-slate-100 hover:border-brand-100 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  user.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {user.status}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 line-clamp-1">{user.full_name}</h3>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {user.phone}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
              No applications found.
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedUser.full_name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedUser.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {selectedUser.phone}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {selectedUser.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate(selectedUser.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                        >
                          <UserCheck className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(selectedUser.id, 'rejected')}
                          variant="outline"
                          className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                        >
                          <UserX className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </>
                    )}
                    <Button 
                      onClick={() => deleteUser(selectedUser.id)}
                      variant="ghost"
                      className="text-slate-400 hover:text-red-600 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Address Information
                    </h4>
                    <p className="text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {selectedUser.address || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Citizenship Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-medium">ID Number</span>
                        <span className="text-slate-900 font-bold">{selectedUser.citizenship_no || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Identity Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.citizenship_front_url ? (
                      <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <Image 
                          src={selectedUser.citizenship_front_url} 
                          alt="ID Front" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a href={selectedUser.citizenship_front_url} target="_blank" className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                        Front Missing
                      </div>
                    )}
                    {selectedUser.citizenship_back_url ? (
                      <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <Image 
                          src={selectedUser.citizenship_back_url} 
                          alt="ID Back" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a href={selectedUser.citizenship_back_url} target="_blank" className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                        Back Missing
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.status === 'approved' && (
                <div className="m-8 mt-0 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> This application has been approved. You can now manually create their member profile in the official Member Registry.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 h-[60vh] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <UserCheck className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Select an application</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2">Choose a member application from the left list to review their details and citizenship documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
