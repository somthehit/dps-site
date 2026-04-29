"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit3, Target, ShieldCheck, History, BarChart3, X } from "lucide-react";

interface Stat {
  id: string;
  value: string;
  labelEn: string;
  labelNe: string;
  sortOrder: number;
}

interface AboutManagerProps {
  initialSettings: Record<string, string>;
}

export default function AboutManager({ initialSettings }: AboutManagerProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState<Stat[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [statForm, setStatForm] = useState<Partial<Stat>>({ value: "", labelEn: "", labelNe: "", sortOrder: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const keysToSave = [
        "about_header_en", "about_header_ne",
        "about_vision_en", "about_vision_ne",
        "about_mission_en", "about_mission_ne",
        "about_history_en", "about_history_ne"
      ];

      for (const key of keysToSave) {
        await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
          body: JSON.stringify({ key, value: settings[key] || "", group: "about" }),
        });
      }
      alert("Settings saved successfully!");
    } catch {
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingStatId ? "PUT" : "POST";
    const url = editingStatId ? `/api/stats/${editingStatId}` : "/api/stats";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify(statForm),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingStatId) {
        setStats(prev => prev.map(s => s.id === editingStatId ? data : s));
      } else {
        setStats(prev => [...prev, data]);
      }
      resetStatForm();
    }
  };

  const handleStatDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/stats/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": getSecret() },
    });
    if (res.ok) {
      setStats(prev => prev.filter(s => s.id !== id));
    }
  };

  const resetStatForm = () => {
    setStatForm({ value: "", labelEn: "", labelNe: "", sortOrder: 0 });
    setIsAddingStat(false);
    setEditingStatId(null);
  };

  const startEditStat = (stat: Stat) => {
    setStatForm(stat);
    setEditingStatId(stat.id);
    setIsAddingStat(true);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Text Content Section */}
      <section className="bg-white p-8 rounded-[32px] border border-brand-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Edit3 className="w-6 h-6 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-800">About Us Content</h2>
        </div>

        {/* Header/Title Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <label className="text-brand-700 font-bold text-sm uppercase tracking-wider block">Page Title (English)</label>
            <input
              type="text"
              value={settings.about_header_en || ""}
              onChange={e => setSettings({ ...settings, about_header_en: e.target.value })}
              placeholder="Growing together since 2061 B.S."
              className="w-full h-12 px-4 border rounded-2xl bg-slate-50 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-brand-700 font-bold text-sm uppercase tracking-wider block">Page Title (Nepali)</label>
            <input
              type="text"
              value={settings.about_header_ne || ""}
              onChange={e => setSettings({ ...settings, about_header_ne: e.target.value })}
              placeholder="वि.सं. २०६१ देखि सँगै बढ्दै"
              className="w-full h-12 px-4 border rounded-2xl bg-slate-50 text-sm font-noto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-700 font-bold text-sm uppercase tracking-wider">
              <Target className="w-4 h-4" /> Vision
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">English</label>
              <textarea
                value={settings.about_vision_en || ""}
                onChange={e => setSettings({ ...settings, about_vision_en: e.target.value })}
                className="w-full h-24 p-4 border rounded-2xl bg-slate-50 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nepali</label>
              <textarea
                value={settings.about_vision_ne || ""}
                onChange={e => setSettings({ ...settings, about_vision_ne: e.target.value })}
                className="w-full h-24 p-4 border rounded-2xl bg-slate-50 text-sm font-noto"
              />
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-700 font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Mission
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">English</label>
              <textarea
                value={settings.about_mission_en || ""}
                onChange={e => setSettings({ ...settings, about_mission_en: e.target.value })}
                className="w-full h-24 p-4 border rounded-2xl bg-slate-50 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nepali</label>
              <textarea
                value={settings.about_mission_ne || ""}
                onChange={e => setSettings({ ...settings, about_mission_ne: e.target.value })}
                className="w-full h-24 p-4 border rounded-2xl bg-slate-50 text-sm font-noto"
              />
            </div>
          </div>
        </div>

        {/* History */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-sm uppercase tracking-wider">
            <History className="w-4 h-4" /> History & Background
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">English</label>
              <textarea
                value={settings.about_history_en || ""}
                onChange={e => setSettings({ ...settings, about_history_en: e.target.value })}
                className="w-full h-40 p-4 border rounded-2xl bg-slate-50 text-sm leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nepali</label>
              <textarea
                value={settings.about_history_ne || ""}
                onChange={e => setSettings({ ...settings, about_history_ne: e.target.value })}
                className="w-full h-40 p-4 border rounded-2xl bg-slate-50 text-sm leading-relaxed font-noto"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 shadow-lg shadow-brand-900/10"
          >
            <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save About Content"}
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-800">Site Statistics</h2>
          </div>
          {!isAddingStat && (
            <button
              onClick={() => setIsAddingStat(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Stat
            </button>
          )}
        </div>

        {isAddingStat && (
          <form onSubmit={handleStatSubmit} className="bg-slate-900 p-8 rounded-[32px] text-white space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingStatId ? "Edit Stat" : "New Stat"}</h3>
              <button type="button" onClick={resetStatForm} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Value (e.g. 3K+, 12 Cr)</label>
                <input required value={statForm.value || ""} onChange={e => setStatForm({ ...statForm, value: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/10 focus:border-brand-400 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Label (English)</label>
                <input required value={statForm.labelEn || ""} onChange={e => setStatForm({ ...statForm, labelEn: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/10 focus:border-brand-400 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Label (Nepali)</label>
                <input required value={statForm.labelNe || ""} onChange={e => setStatForm({ ...statForm, labelNe: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/10 focus:border-brand-400 outline-none font-noto" />
              </div>
            </div>
            <button type="submit" className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-400 transition-all">
              {editingStatId ? "Update Stat" : "Create Stat"}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(stat => (
            <div key={stat.id} className="bg-white p-6 rounded-[24px] border border-slate-200 flex justify-between items-center group hover:border-brand-300 transition-all">
              <div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.labelEn} / {stat.labelNe}</div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEditStat(stat)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleStatDelete(stat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
