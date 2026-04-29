"use client";
import { useState } from "react";
import { Plus, Trash2, Save, Edit3, X, Package, HelpCircle } from "lucide-react";
import { getPublicUrl } from "@/utils/supabase/storage";
import Image from "next/image";

type Service = {
  id: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  category: string;
  icon: string;
  imageKey?: string | null;
  featuresEn: string[] | null;
  featuresNe: string[] | null;
};

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({
    titleEn: "",
    titleNe: "",
    descEn: "",
    descNe: "",
    category: "",
    icon: "Package",
    imageKey: "",
    featuresEn: [],
    featuresNe: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/services/${editingId}` : "/api/services";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingId) {
          setServices(prev => prev.map(s => s.id === editingId ? data : s));
        } else {
          setServices(prev => [...prev, data]);
        }
        resetForm();
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || "Failed to save"));
      }
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to save service");
    }
  };

  const handleAddFeature = (lang: 'en' | 'ne') => {
    const key = lang === 'en' ? 'featuresEn' : 'featuresNe';
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), ""]
    }));
  };

  const handleUpdateFeature = (lang: 'en' | 'ne', index: number, value: string) => {
    const key = lang === 'en' ? 'featuresEn' : 'featuresNe';
    const newFeatures = [...(formData[key] || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, [key]: newFeatures }));
  };

  const handleRemoveFeature = (lang: 'en' | 'ne', index: number) => {
    const key = lang === 'en' ? 'featuresEn' : 'featuresNe';
    const newFeatures = [...(formData[key] || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, [key]: newFeatures }));
  };

  const resetForm = () => {
    setFormData({
      titleEn: "",
      titleNe: "",
      descEn: "",
      descNe: "",
      category: "",
      icon: "Package",
      featuresEn: [],
      featuresNe: []
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      ...service,
      featuresEn: service.featuresEn || [],
      featuresNe: service.featuresNe || []
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Available Services ({services.length})</h2>
        {!isAdding && (
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-brand-700 text-white px-6 py-3 rounded-2xl hover:bg-brand-600 transition-all font-bold shadow-lg shadow-brand-900/10"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Use Lucide icons: &quot;Banknote&quot;, &quot;Wallet&quot;, &quot;Sprout&quot;, etc.
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">{editingId ? "Edit Service" : "New Service"}</h3>
            <button type="button" onClick={resetForm} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title (EN)</label>
              <input 
                value={formData.titleEn} 
                onChange={e => setFormData({...formData, titleEn: e.target.value})}
                placeholder="e.g. Daily Savings Account"
                required className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title (NE)</label>
              <input 
                value={formData.titleNe} 
                onChange={e => setFormData({...formData, titleNe: e.target.value})}
                placeholder="उदा. दैनिक बचत खाता"
                required className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hero Image</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={formData.imageKey || ""} 
                  onChange={e => setFormData({...formData, imageKey: e.target.value})}
                  className="w-full h-12 px-4 border rounded-xl bg-slate-50 focus:bg-white transition-all text-sm"
                  placeholder="Storage key or URL..."
                />
              </div>
              <div className="relative overflow-hidden shrink-0">
                <button type="button" className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all">
                  {isUploading ? "Uploading..." : "Upload Hero"}
                </button>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.url) setFormData({ ...formData, imageKey: data.url });
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {formData.imageKey && (
              <div className="mt-2 w-full h-32 rounded-2xl border overflow-hidden relative">
                <Image 
                  src={formData.imageKey.startsWith('http') ? formData.imageKey : getPublicUrl(formData.imageKey)} 
                  alt="Preview" 
                  fill
                  className="object-cover" 
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category (Slug, e.g. savings)</label>
              <input 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. savings, loans, agriculture"
                required className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Icon Name (Lucide)</label>
              <input 
                value={formData.icon} 
                onChange={e => setFormData({...formData, icon: e.target.value})}
                placeholder="e.g. Banknote, Tractor, Sprout"
                required className="w-full h-12 px-4 border rounded-xl focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (EN)</label>
              <textarea 
                value={formData.descEn} 
                onChange={e => setFormData({...formData, descEn: e.target.value})}
                placeholder="Describe service in English..."
                required className="w-full p-4 border rounded-xl h-24 focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (NE)</label>
              <textarea 
                value={formData.descNe} 
                onChange={e => setFormData({...formData, descNe: e.target.value})}
                placeholder="यस सेवाको बारेमा नेपालीमा..."
                required className="w-full p-4 border rounded-xl h-24 focus:ring-2 focus:ring-brand-500 transition-all" 
              />
            </div>
          </div>

          {/* Features Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* EN Features */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features (EN)</label>
                 <button type="button" onClick={() => handleAddFeature('en')} className="text-[10px] font-bold text-brand-600 hover:underline">
                   + Add Feature
                 </button>
               </div>
               <div className="space-y-2">
                 {formData.featuresEn?.map((feat, i) => (
                   <div key={i} className="flex gap-2">
                     <input 
                        value={feat} 
                        onChange={e => handleUpdateFeature('en', i, e.target.value)}
                        className="flex-1 h-10 px-3 text-sm border rounded-lg focus:ring-1 focus:ring-brand-500" 
                        placeholder="Feature label"
                     />
                     <button type="button" onClick={() => handleRemoveFeature('en', i)} className="p-2 text-red-400 hover:text-red-600">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 {formData.featuresEn?.length === 0 && <p className="text-[10px] text-slate-400 italic">No features added</p>}
               </div>
            </div>

            {/* NE Features */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features (NE)</label>
                 <button type="button" onClick={() => handleAddFeature('ne')} className="text-[10px] font-bold text-brand-600 hover:underline">
                   + थप्नुहोस्
                 </button>
               </div>
               <div className="space-y-2">
                 {formData.featuresNe?.map((feat, i) => (
                   <div key={i} className="flex gap-2">
                     <input 
                        value={feat} 
                        onChange={e => handleUpdateFeature('ne', i, e.target.value)}
                        className="flex-1 h-10 px-3 text-sm border rounded-lg focus:ring-1 focus:ring-brand-500" 
                        placeholder="विशेषता"
                     />
                     <button type="button" onClick={() => handleRemoveFeature('ne', i)} className="p-2 text-red-400 hover:text-red-600">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 {formData.featuresNe?.length === 0 && <p className="text-[10px] text-slate-400 italic">कुनै विशेषता छैन</p>}
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-700 text-white h-14 rounded-2xl font-bold hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20">
            <Save className="w-5 h-5" /> {editingId ? "Save Changes" : "Create Service"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{service.titleEn} / {service.titleNe}</h4>
                <p className="text-xs text-slate-500">Category: <span className="font-mono bg-slate-100 px-1 rounded">{service.category}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(service)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(service.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No services added yet. Click &quot;Add Service&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
