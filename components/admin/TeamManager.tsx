"use client";
import { useState } from "react";
import { Plus, Trash2, Edit3, X, Camera, Users, ChevronDown } from "lucide-react";

import { uploadFile, deleteFile, getPublicUrl } from "@/utils/supabase/storage";

type TeamMember = {
  id: string;
  nameEn: string;
  nameNe: string;
  roleEn: string;
  roleNe: string;
  department: string;
  bioEn: string;
  bioNe: string;
  educationEn: string | null;
  educationNe: string | null;
  experienceEn: string[] | null;
  experienceNe: string[] | null;
  expertiseEn: string[] | null;
  expertiseNe: string[] | null;
  imageKey: string;
  sortOrder: number;
};

export default function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<TeamMember>>({
    nameEn: "", nameNe: "", roleEn: "", roleNe: "",
    department: "board", sortOrder: 0, imageKey: "",
    bioEn: "", bioNe: "",
    educationEn: "", educationNe: "",
    experienceEn: [], experienceNe: [],
    expertiseEn: [], expertiseNe: []
  });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState("all");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const path = await uploadFile(file, "team");
      setFormData(prev => ({ ...prev, imageKey: path }));
      if (editingId) {
        setImageErrors(prev => {
          const newState = { ...prev };
          delete newState[editingId];
          return newState;
        });
      }
    } catch {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/team/${editingId}` : "/api/team";

    // Create a copy without the ID to avoid DB errors
    const dataToSave = { ...formData };
    delete dataToSave.id;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setMembers(prev => prev.map(m => m.id === editingId ? data : m));
        setImageErrors(prev => {
          const newState = { ...prev };
          delete newState[editingId];
          return newState;
        });
      } else {
        setMembers(prev => [...prev, data]);
      }
      resetForm();
    } else {
      const errorData = await res.json();
      alert(`Save failed: ${errorData.error || res.statusText}`);
    }
  };

  const handleDelete = async (id: string, imageKey: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteFile(imageKey);
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      nameEn: "", nameNe: "", roleEn: "", roleNe: "",
      department: "board", sortOrder: 0, imageKey: "",
      bioEn: "", bioNe: "",
      educationEn: "", educationNe: "",
      experienceEn: [], experienceNe: [],
      expertiseEn: [], expertiseNe: []
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (m: TeamMember) => {
    setFormData({
      ...m,
      department: m.department?.toLowerCase() || "board"
    });
    setEditingId(m.id);
    setIsAdding(true);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredMembers = activeFilter === "all"
    ? members
    : members.filter(m => m.department?.toLowerCase() === activeFilter.toLowerCase());

  const departments = [
    { id: "all", label: "All Members" },
    { id: "board", label: "Board of Directors (सञ्चालक समिति)" },
    { id: "management", label: "Senior Management (उच्च व्यवस्थापन)" },
    { id: "finance", label: "Finance & Accounts (वित्त तथा लेखा)" },
    { id: "agriculture", label: "Agriculture (कृषि तथा पशुपालन)" },
    { id: "technology", label: "IT & Technology (प्राविधिक तथा आईटी)" },
    { id: "operations", label: "Operations (सञ्चालन तथा सेवा)" },
    { id: "audit", label: "Audit (लेखा सुपरिवेक्षण)" },
    { id: "credit", label: "Credit (ऋण उपसमिति)" },
    { id: "savings", label: "Savings (बचत उपसमिति)" },
    { id: "education", label: "Education (शिक्षा तथा तालिम)" },
    { id: "staff", label: "Office & Field Staff (कर्मचारी)" }
  ];

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .thin-scrollbar::-webkit-scrollbar { height: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header bar with count + Add button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" /> Team Members
          <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{filteredMembers.length}</span>
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all text-xs font-bold shrink-0 shadow-lg shadow-brand-200"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* Filter dropdown */}
      <div className="relative w-full sm:w-72">
        <select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
        >
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Add / Edit form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border border-brand-200 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">{editingId ? "Edit Member" : "New Member"}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="relative group mx-auto w-32 h-32">
                <div className="w-full h-full rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden">
                  {formData.imageKey ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPublicUrl(formData.imageKey)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400" />
                  )}
                  {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-bold text-brand-600">...</div>}
                </div>
                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Name (EN)" required value={formData.nameEn || ""} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
              <input placeholder="Name (NE)" required value={formData.nameNe || ""} onChange={e => setFormData({ ...formData, nameNe: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
              <input placeholder="Role (EN)" required value={formData.roleEn || ""} onChange={e => setFormData({ ...formData, roleEn: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
              <input placeholder="Role (NE)" required value={formData.roleNe || ""} onChange={e => setFormData({ ...formData, roleNe: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
              <select value={formData.department || "board"} onChange={e => setFormData({ ...formData, department: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm">
                {departments.filter(d => d.id !== "all").map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <input type="number" placeholder="Order" value={formData.sortOrder || 0} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea placeholder="Bio (EN)" rows={2} value={formData.bioEn || ""} onChange={e => setFormData({ ...formData, bioEn: e.target.value })} className="p-3 border rounded-xl bg-slate-50 text-sm" />
            <textarea placeholder="Bio (NE)" rows={2} value={formData.bioNe || ""} onChange={e => setFormData({ ...formData, bioNe: e.target.value })} className="p-3 border rounded-xl bg-slate-50 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Education (EN)" value={formData.educationEn || ""} onChange={e => setFormData({ ...formData, educationEn: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
            <input placeholder="Education (NE)" value={formData.educationNe || ""} onChange={e => setFormData({ ...formData, educationNe: e.target.value })} className="h-10 px-4 border rounded-xl bg-slate-50 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              placeholder="Expertise (EN) - one per line"
              rows={2}
              value={formData.expertiseEn?.join("\n") || ""}
              onChange={e => setFormData({ ...formData, expertiseEn: e.target.value.split("\n").filter(x => x.trim()) })}
              className="p-3 border rounded-xl bg-slate-50 text-sm font-mono"
            />
            <textarea
              placeholder="Expertise (NE) - one per line"
              rows={2}
              value={formData.expertiseNe?.join("\n") || ""}
              onChange={e => setFormData({ ...formData, expertiseNe: e.target.value.split("\n").filter(x => x.trim()) })}
              className="p-3 border rounded-xl bg-slate-50 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              placeholder="Experience (EN) - one per line"
              rows={2}
              value={formData.experienceEn?.join("\n") || ""}
              onChange={e => setFormData({ ...formData, experienceEn: e.target.value.split("\n").filter(x => x.trim()) })}
              className="p-3 border rounded-xl bg-slate-50 text-sm font-mono"
            />
            <textarea
              placeholder="Experience (NE) - one per line"
              rows={2}
              value={formData.experienceNe?.join("\n") || ""}
              onChange={e => setFormData({ ...formData, experienceNe: e.target.value.split("\n").filter(x => x.trim()) })}
              className="p-3 border rounded-xl bg-slate-50 text-sm font-mono"
            />
          </div>

          <button type="submit" disabled={!formData.imageKey} className="w-full bg-brand-700 text-white h-10 rounded-xl font-bold hover:bg-brand-600 text-sm transition-all disabled:opacity-50">
            {editingId ? "Update" : "Save Member"}
          </button>
        </form>
      )}

      {/* Member list — compact horizontal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              {member.imageKey && !imageErrors[member.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPublicUrl(member.imageKey)}
                  alt={member.nameEn}
                  className="w-full h-full object-cover"
                  onError={() => setImageErrors(prev => ({ ...prev, [member.id]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-900 text-brand-100 text-[10px] font-bold italic">
                  {getInitials(member.nameEn)}
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-slate-900 text-xs truncate">{member.nameEn}</h4>
              <p className="text-[10px] text-slate-500 truncate">{member.roleEn}</p>
              <div className="text-[8px] font-bold text-brand-600 uppercase tracking-tighter opacity-70">{member.department}</div>
            </div>

            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(member)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(member.id, member.imageKey)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
