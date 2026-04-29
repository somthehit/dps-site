"use client";
import { useState } from "react";
import {
  Plus, Trash2, Edit3, X, Save,
  TrendingUp, Users, Landmark, Wheat, Banknote, HandCoins,
  BarChart2, ShieldCheck, Star, Sprout, Home, Tractor,
  BookOpen, Award, Globe, Layers,
} from "lucide-react";

// ── Icon catalogue ──────────────────────────────────────────────
const ICON_OPTIONS: { name: string; component: React.ElementType }[] = [
  { name: "TrendingUp",  component: TrendingUp  },
  { name: "Users",       component: Users       },
  { name: "Landmark",    component: Landmark    },
  { name: "Wheat",       component: Wheat       },
  { name: "Banknote",    component: Banknote    },
  { name: "HandCoins",   component: HandCoins   },
  { name: "BarChart2",   component: BarChart2   },
  { name: "ShieldCheck", component: ShieldCheck },
  { name: "Star",        component: Star        },
  { name: "Sprout",      component: Sprout      },
  { name: "Home",        component: Home        },
  { name: "Tractor",     component: Tractor     },
  { name: "BookOpen",    component: BookOpen    },
  { name: "Award",       component: Award       },
  { name: "Globe",       component: Globe       },
  { name: "Layers",      component: Layers      },
];

// ── Colour palette ──────────────────────────────────────────────
const COLOR_OPTIONS = [
  { label: "Brand Green",   value: "#1a6b3c" },
  { label: "Emerald",       value: "#059669" },
  { label: "Teal",          value: "#0d9488" },
  { label: "Sky Blue",      value: "#0284c7" },
  { label: "Indigo",        value: "#4f46e5" },
  { label: "Purple",        value: "#7c3aed" },
  { label: "Rose",          value: "#e11d48" },
  { label: "Orange",        value: "#ea580c" },
  { label: "Amber",         value: "#d97706" },
  { label: "Slate",         value: "#475569" },
];

// ── Helper: resolve icon component by name ──────────────────────
function IconByName({ name, className }: { name?: string | null; className?: string }) {
  const found = ICON_OPTIONS.find(i => i.name === name);
  const Comp = found?.component ?? TrendingUp;
  return <Comp className={className ?? "w-5 h-5"} />;
}

// ── Types ───────────────────────────────────────────────────────
type Stat = {
  id: string;
  value: string;
  labelEn: string;
  labelNe: string;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
};

// ── Component ───────────────────────────────────────────────────
export default function StatsManager({ initialStats }: { initialStats: Stat[] }) {
  const [stats, setStats]       = useState(initialStats);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Stat>>({
    value: "", labelEn: "", labelNe: "", icon: "TrendingUp", color: "#1a6b3c", sortOrder: 0,
  });

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url    = editingId ? `/api/stats/${editingId}` : "/api/stats";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setStats(prev => prev.map(s => s.id === editingId ? data : s));
      } else {
        setStats(prev => [...prev, data]);
      }
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/stats/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": getSecret() },
    });
    if (res.ok) setStats(prev => prev.filter(s => s.id !== id));
  };

  const resetForm = () => {
    setFormData({ value: "", labelEn: "", labelNe: "", icon: "TrendingUp", color: "#1a6b3c", sortOrder: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (s: Stat) => {
    setFormData(s);
    setEditingId(s.id);
    setIsAdding(true);
  };

  // ── Preview colour (fallback to brand green) ──
  const previewColor = formData.color ?? "#1a6b3c";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Impact Statistics ({stats.length})</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        )}
      </div>

      {/* Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-slate-900">{editingId ? "Edit Statistic" : "Add Statistic"}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Value */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Value (e.g. 3K+, 12Cr+)</label>
              <input
                required
                value={formData.value || ""}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full h-12 px-4 border rounded-xl bg-slate-50"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Sort Order</label>
              <input
                type="number"
                required
                value={formData.sortOrder ?? 0}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full h-12 px-4 border rounded-xl bg-slate-50"
              />
            </div>

            {/* Label EN */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Label (English)</label>
              <input
                required
                value={formData.labelEn || ""}
                onChange={e => setFormData({ ...formData, labelEn: e.target.value })}
                className="w-full h-12 px-4 border rounded-xl bg-slate-50"
              />
            </div>

            {/* Label NE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Label (Nepali)</label>
              <input
                required
                value={formData.labelNe || ""}
                onChange={e => setFormData({ ...formData, labelNe: e.target.value })}
                className="w-full h-12 px-4 border rounded-xl bg-slate-50"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ name, component: Comp }) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                    formData.icon === name
                      ? "border-brand-600 bg-brand-50 text-brand-700 shadow-md scale-110"
                      : "border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600"
                  }`}
                >
                  <Comp className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Color</label>
            <div className="flex flex-wrap gap-3 items-center">
              {COLOR_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setFormData({ ...formData, color: value })}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${
                    formData.color === value
                      ? "border-slate-700 scale-125 shadow-lg"
                      : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: value }}
                />
              ))}
              {/* Custom colour input */}
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input
                  type="color"
                  value={formData.color ?? "#1a6b3c"}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-8 h-8 rounded-full cursor-pointer border border-slate-300"
                  title="Custom color"
                />
                Custom
              </label>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: previewColor + "22", color: previewColor }}
            >
              <IconByName name={formData.icon} className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{formData.value || "0"}</div>
              <div className="text-xs font-bold text-slate-500 uppercase">{formData.labelEn || "Label"}</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-700 text-white h-14 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> {editingId ? "Update Stat" : "Save Stat"}
          </button>
        </form>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const cardColor = stat.color ?? "#1a6b3c";
          return (
            <div key={stat.id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-brand-300 transition-all group relative">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cardColor + "22", color: cardColor }}
                >
                  <IconByName name={stat.icon} className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">{stat.labelEn}</div>
              <div className="text-xs text-slate-400">{stat.labelNe}</div>

              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(stat)} className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(stat.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
