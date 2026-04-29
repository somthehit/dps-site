"use client";
import { useState } from "react";
import { Plus, Trash2, X, Camera, Save } from "lucide-react";

import { getPublicUrl, uploadFile, deleteFile } from "@/utils/supabase/storage";

export type GalleryItem = {
  id: string;
  titleEn: string;
  titleNe: string;
  category: string;
  imageKey: string;
  createdAt: Date | null;
};

export default function GalleryManager({ initialImages }: { initialImages: GalleryItem[] }) {
  const [images, setImages] = useState(initialImages);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    titleEn: "", titleNe: "", category: "events", imageKey: ""
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
      const path = await uploadFile(file, "gallery");
      setFormData(prev => ({ ...prev, imageKey: path }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setImages(prev => [data, ...prev]);
      resetForm();
    }
  };

  const handleDelete = async (id: string, imageKey: string) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      // 1. Delete from Storage
      await deleteFile(imageKey);
      
      // 2. Delete from Database
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": getSecret() },
      });
      
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({ titleEn: "", titleNe: "", category: "events", imageKey: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Gallery Management ({images.length})</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add Image
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">Add New Image</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Title (English)</label>
              <input required value={formData.titleEn || ""} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Title (Nepali)</label>
              <input required value={formData.titleNe || ""} onChange={e => setFormData({...formData, titleNe: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-12 px-4 border rounded-xl bg-slate-50">
                <option value="events">Events</option>
                <option value="office">Office</option>
                <option value="csr">CSR Activities</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Image File</label>
              <div className="relative h-12">
                <div className="absolute inset-0 flex items-center px-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 group hover:border-brand-400 transition-all cursor-pointer">
                   {formData.imageKey ? (
                     <span className="text-sm text-brand-600 font-medium truncate">{formData.imageKey.split('/').pop()}</span>
                   ) : (
                     <div className="flex items-center gap-2 text-slate-400">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to select photo</span>
                     </div>
                   )}
                   {isUploading && <span className="ml-auto text-xs font-bold text-brand-600 animate-pulse">Uploading...</span>}
                </div>
                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={!formData.imageKey} className="w-full bg-brand-700 text-white h-14 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save to Gallery
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map(img => (
          <div key={img.id} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
            <div className="aspect-square relative overflow-hidden bg-slate-100">
              <img src={getPublicUrl(img.imageKey)} alt={img.titleEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="text-white font-bold text-sm truncate">{img.titleEn}</div>
                <div className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{img.category}</div>
              </div>
              <button 
                onClick={() => handleDelete(img.id, img.imageKey)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
