"use client";
import { useState } from "react";
import { Plus, Trash2, X, Download, FileText, Save, Upload } from "lucide-react";

import { uploadFile, deleteFile, getPublicUrl } from "@/utils/supabase/storage";

type DownloadItem = {
  id: string;
  titleEn: string;
  titleNe: string;
  category: string;
  fileKey: string;
  createdAt: Date | null;
};

export default function DownloadsManager({ initialDownloads }: { initialDownloads: DownloadItem[] }) {
  const [items, setItems] = useState(initialDownloads);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<DownloadItem>>({
    titleEn: "", titleNe: "", category: "forms", fileKey: ""
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
      const path = await uploadFile(file, "downloads");
      setFormData(prev => ({ ...prev, fileKey: path }));
    } catch {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setItems(prev => [data, ...prev]);
      resetForm();
    }
  };

  const handleDelete = async (id: string, fileKey: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteFile(fileKey);
      const res = await fetch(`/api/downloads/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": getSecret() },
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({ titleEn: "", titleNe: "", category: "forms", fileKey: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Downloadable Files ({items.length})</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">Add New Document</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Title (English)</label>
              <input required value={formData.titleEn || ""} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Title (Nepali)</label>
              <input required value={formData.titleNe || ""} onChange={e => setFormData({ ...formData, titleNe: e.target.value })} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-12 px-4 border rounded-xl bg-slate-50">
                <option value="forms">Membership & Loan Forms</option>
                <option value="reports">Annual Reports</option>
                <option value="bylaws">Bylaws & Policies</option>
                <option value="other">Other Documents</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">File (PDF/DOCX/JPG)</label>
              <div className="relative h-12">
                <div className="absolute inset-0 flex items-center px-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 group hover:border-brand-400 transition-all cursor-pointer">
                  {formData.fileKey ? (
                    <span className="text-sm text-brand-600 font-medium truncate">{formData.fileKey.split('/').pop()}</span>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Click to select file</span>
                    </div>
                  )}
                  {isUploading && <span className="ml-auto text-xs font-bold text-brand-600 animate-pulse">Uploading...</span>}
                </div>
                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={!formData.fileKey} className="w-full bg-brand-700 text-white h-14 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save Document
          </button>
        </form>
      )}

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.titleEn}</div>
                      <div className="text-xs text-slate-500">{item.titleNe}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a href={getPublicUrl(item.fileKey)} target="_blank" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
                      <Download className="w-5 h-5" />
                    </a>
                    <button onClick={() => handleDelete(item.id, item.fileKey)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-medium">No documents uploaded yet.</div>
        )}
      </div>
    </div>
  );
}
