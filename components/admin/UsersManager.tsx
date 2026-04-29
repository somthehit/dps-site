"use client";
import { useState } from "react";
import { Trash2, Mail, UserPlus, X } from "lucide-react";

type SystemUser = {
  id: string;
  userId: string | null;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date | null;
};

export default function UsersManager({ initialUsers }: { initialUsers: SystemUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "staff" });

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const newUser = await res.json();
      setUsers(prev => [newUser, ...prev]);
      setIsAdding(false);
      setFormData({ name: "", email: "", password: "", role: "staff" });
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add user");
    }
  };

  const updateRole = async (id: string, newRole: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": getSecret() },
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Control Panel Users ({users.length})</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-6 py-2.5 rounded-2xl hover:bg-brand-600 transition-all font-bold shadow-lg shadow-brand-900/20"
          >
            <UserPlus className="w-5 h-5" /> Add New User
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-[32px] border border-brand-100 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-xl text-slate-900">Create System Account</h3>
              <p className="text-sm text-slate-500">Add a new administrator or staff member</p>
            </div>
            <button type="button" onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required className="w-full h-12 px-5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                required className="w-full h-12 px-5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Account Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required className="w-full h-12 px-5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">System Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-12 px-5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-bold"
              >
                <option value="staff">Staff (Editor Access)</option>
                <option value="admin">Admin (Master Access)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]">
            Add System User
          </button>
        </form>
      )}

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User Information</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account Type</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                      <span className="font-bold text-lg uppercase">{user.name?.[0] || user.email[0]}</span>
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-base">{user.name || 'No Name'}</div>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 opacity-50" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full outline-none transition-all cursor-pointer border ${user.role === 'admin'
                          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                    title="Remove User"
                  >
                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-500">
                  No system users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
