"use client";
import { useState } from "react";
import { Plus, Trash2, Edit3, X, Save, Megaphone } from "lucide-react";

type TickerItem = {
  id: string;
  contentEn: string;
  contentNe: string;
  isActive: boolean;
  sortOrder: number;
};

export default function TickerManager({ initialItems }: { initialItems: TickerItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TickerItem>>({
    contentEn: "", contentNe: "", isActive: true, sortOrder: 0
  });

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/news-ticker/${editingId}` : "/api/news-ticker";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setItems(prev => prev.map(item => item.id === editingId ? data : item));
      } else {
        setItems(prev => [...prev, data]);
      }
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/news-ticker/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": getSecret() },
    });
    if (res.ok) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ contentEn: "", contentNe: "", isActive: true, sortOrder: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (item: TickerItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">News Ticker Items ({items.length})</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add News Item
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">{editingId ? "Edit News Item" : "Add News Item"}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Content (English)</label>
               <textarea 
                required 
                value={formData.contentEn || ""} 
                onChange={e => setFormData({...formData, contentEn: e.target.value})} 
                className="w-full h-24 p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-500 transition-all" 
                placeholder="Enter news in English..."
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Content (Nepali)</label>
               <textarea 
                required 
                value={formData.contentNe || ""} 
                onChange={e => setFormData({...formData, contentNe: e.target.value})} 
                className="w-full h-24 p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-500 transition-all font-nepali" 
                placeholder="Enter news in Nepali..."
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Sort Order</label>
                 <input type="number" required value={formData.sortOrder || 0} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full h-12 px-4 border rounded-xl bg-slate-50" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                 <select 
                  value={formData.isActive ? "true" : "false"} 
                  onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}
                  className="w-full h-12 px-4 border rounded-xl bg-slate-50"
                 >
                   <option value="true">Active</option>
                   <option value="false">Hidden</option>
                 </select>
               </div>
             </div>
          </div>

          <button type="submit" className="w-full bg-brand-700 text-white h-14 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> {editingId ? "Update Item" : "Save Item"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {items.sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
          <div key={item.id} className={`bg-white p-6 rounded-[24px] border ${item.isActive ? 'border-slate-200' : 'border-red-100 bg-red-50/10'} shadow-sm hover:border-brand-300 transition-all group relative`}>
            <div className="flex items-start gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.isActive ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600'}`}>
                  <Megaphone className="w-6 h-6" />
               </div>
               <div className="flex-grow min-w-0">
                 <div className="font-medium text-slate-900 mb-1">{item.contentEn}</div>
                 <div className="text-slate-500 font-nepali">{item.contentNe}</div>
                 <div className="flex items-center gap-3 mt-3">
                   <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Order: {item.sortOrder}</span>
                   {!item.isActive && <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded">Hidden</span>}
                 </div>
               </div>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
               <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <p className="text-slate-400">No news ticker items yet. Add your first announcement above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
