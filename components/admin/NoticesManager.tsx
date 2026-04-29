"use client";
import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit3, X, Save, Bell, Calendar, AlertCircle } from "lucide-react";

import { uploadFile, deleteFile, getPublicUrl } from "@/utils/supabase/storage";

export type Notice = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  contentEn: string;
  contentNe: string;
  tagEn: string;
  tagNe: string;
  category: string;
  date: string;
  imageKey: string | null;
};

export default function NoticesManager({ initialNotices }: { initialNotices: Notice[] }) {
  const [items, setItems] = useState(initialNotices);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Notice>>({
    titleEn: "", titleNe: "", descEn: "", descNe: "",
    contentEn: "", contentNe: "", tagEn: "Notice", tagNe: "सूचना",
    category: "general", date: new Date().toISOString().split('T')[0],
    imageKey: ""
  });

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const path = await uploadFile(file, "notices");
      setFormData(prev => ({ ...prev, imageKey: path }));
    } catch {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/notices/${editingId}` : "/api/notices";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setItems(prev => prev.map(i => i.id === editingId ? data : i));
      } else {
        setItems(prev => [data, ...prev]);
      }
      resetForm();
    }
  };

  const handleDelete = async (id: string, imageKey: string | null) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      if (imageKey) {
        await deleteFile(imageKey);
      }
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": getSecret() },
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({ 
      titleEn: "", titleNe: "", descEn: "", descNe: "",
      contentEn: "", contentNe: "", tagEn: "Notice", tagNe: "सूचना",
      category: "general", date: new Date().toISOString().split('T')[0],
      imageKey: ""
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (item: Notice) => {
    // Format date for input[type="date"]
    const formattedDate = item.date ? new Date(item.date).toISOString().split('T')[0] : "";
    setFormData({ ...item, date: formattedDate });
    setEditingId(item.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Posted Notices ({items.length})</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add Notice
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">{editingId ? "Edit Notice" : "Post New Notice"}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Title (English)</label>
                 <input required value={formData.titleEn || ""} onChange={e => setFormData({...formData, titleEn: e.target.value})} placeholder="e.g. Annual General Meeting 2026" className="w-full h-12 px-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Short Description (English)</label>
                 <textarea required value={formData.descEn || ""} onChange={e => setFormData({...formData, descEn: e.target.value})} placeholder="Brief summary of the notice..." className="w-full h-24 p-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tag (English)</label>
                 <input required value={formData.tagEn || ""} onChange={e => setFormData({...formData, tagEn: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" placeholder="Notice, Urgent, Event..." />
               </div>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Title (Nepali)</label>
                 <input required value={formData.titleNe || ""} onChange={e => setFormData({...formData, titleNe: e.target.value})} placeholder="उदा. वार्षिक साधारण सभा २०८२" className="w-full h-12 px-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Short Description (Nepali)</label>
                 <textarea required value={formData.descNe || ""} onChange={e => setFormData({...formData, descNe: e.target.value})} placeholder="सूचनाको संक्षिप्त विवरण..." className="w-full h-24 p-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tag (Nepali)</label>
                 <input required value={formData.tagNe || ""} onChange={e => setFormData({...formData, tagNe: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50 placeholder:text-slate-300" placeholder="सूचना, जरुरी..." />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Publish Date</label>
               <input type="date" required value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
               <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50">
                  <option value="notice">General Notice</option>
                  <option value="agm">AGM Update</option>
                  <option value="loan">Loan Notice</option>
                  <option value="career">Career</option>
               </select>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Upload Notice Document/Photo (Optional)</label>
             <div className="flex items-center gap-4">
               <input type="file" onChange={handleUpload} accept="image/*,.pdf" className="flex-1 h-12 px-4 py-2 border rounded-xl bg-slate-50" />
               {isUploading && <span className="text-sm font-bold text-brand-600 animate-pulse">Uploading...</span>}
               {formData.imageKey && !isUploading && <span className="text-sm font-bold text-green-600">File Attached ✓</span>}
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Full Content</label>
             <textarea required value={formData.contentEn || ""} onChange={e => setFormData({...formData, contentEn: e.target.value, contentNe: e.target.value})} className="w-full h-48 p-4 border rounded-xl bg-slate-50 font-sans text-sm placeholder:text-slate-300" placeholder="Provide the full detailed notice text here..." />
          </div>

          <button type="submit" disabled={isUploading} className="w-full bg-brand-700 text-white h-14 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-900/10">
            <Save className="w-5 h-5" /> {editingId ? "Update Notice" : "Post Notice"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-brand-300 transition-all group relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.tagEn === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                     <Bell className="w-6 h-6" />
                  </div>
                  {item.imageKey && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                      <Image src={getPublicUrl(item.imageKey)} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.tagEn === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                           {item.tagEn}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium"><Calendar className="w-3 h-3" /> {item.date ? new Date(item.date).toLocaleDateString() : ""}</span>
                     </div>
                     <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.titleEn}</h3>
                     <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{item.category}</p>
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(item.id, item.imageKey)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
               </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-[32px] border border-dashed border-slate-200">
             <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="font-medium">No notices posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
