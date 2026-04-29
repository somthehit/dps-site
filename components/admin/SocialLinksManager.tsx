"use client";
import { useState } from "react";
import { Save, Eye, EyeOff, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TiktokIcon, InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import React from "react";

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: Date | null;
};

const PLATFORM_META: Record<string, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  facebook:  { label: "Facebook",  color: "bg-blue-600",   Icon: FacebookIcon },
  twitter:   { label: "Twitter / X", color: "bg-slate-900",  Icon: TwitterIcon },
  instagram: { label: "Instagram", color: "bg-pink-600",   Icon: InstagramIcon },
  youtube:   { label: "YouTube",   color: "bg-red-600",    Icon: YoutubeIcon },
  linkedin:  { label: "LinkedIn",  color: "bg-blue-700",   Icon: LinkedinIcon },
  whatsapp:  { label: "WhatsApp",  color: "bg-green-600",  Icon: WhatsappIcon },
  tiktok:    { label: "TikTok",    color: "bg-slate-950",  Icon: TiktokIcon },
};

export default function SocialLinksManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const getSecret = () =>
    typeof window !== "undefined"
      ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
      : "";

  const updateLink = async (id: string, patch: Partial<SocialLink>) => {
    setSaving(id);
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const link = links.find(l => l.id === id);
    if (!link) return;
    
    await fetch("/api/social-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ id, platform: link.platform, ...patch }),
    });
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  const addLink = async (platform: string) => {
    const res = await fetch("/api/social-links", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ 
        platform, 
        url: "", 
        isActive: false, 
        sortOrder: links.length 
      }),
    });
    const newLink = await res.json();
    setLinks([...links, newLink]);
    setShowAdd(false);
  };

  const removeLink = async (id: string) => {
    if (!confirm("Are you sure you want to remove this social platform?")) return;
    await fetch("/api/social-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ id }),
    });
    setLinks(links.filter(l => l.id !== id));
  };

  const availablePlatforms = Object.keys(PLATFORM_META).filter(
    p => !links.some(l => l.platform === p)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900">Manage Platforms</h3>
          <p className="text-sm text-slate-500 font-medium">Configure where your members can find you</p>
        </div>
        
        {availablePlatforms.length > 0 && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
          >
            <Plus className="w-4 h-4" />
            Add Platform
          </button>
        )}
      </div>

      {showAdd && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          {availablePlatforms.map(platform => {
            const meta = PLATFORM_META[platform];
            return (
              <button
                key={platform}
                onClick={() => addLink(platform)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all group"
              >
                <div className={`${meta.color} w-8 h-8 rounded-lg flex items-center justify-center text-white`}>
                  <meta.Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-brand-700">{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4">
        {links.map((link) => {
          const meta = PLATFORM_META[link.platform];
          if (!meta) return null;
          const { label, color, Icon } = meta;

          return (
            <div
              key={link.id}
              className={`bg-white rounded-2xl border ${link.isActive ? "border-slate-200" : "border-slate-100 opacity-60"} shadow-sm overflow-hidden group`}
            >
              <div className="flex items-center gap-4 p-5">
                <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-current/10`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                    {!link.isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded uppercase">Hidden</span>}
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))}
                    placeholder={`your ${label} profile URL`}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all text-sm font-medium text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateLink(link.id, { isActive: !link.isActive })}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${link.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    title={link.isActive ? "Visible" : "Hidden"}
                  >
                    {link.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => updateLink(link.id, { url: link.url })}
                    disabled={saving === link.id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-all disabled:opacity-60 shadow-lg shadow-brand-500/20"
                  >
                    {saved === link.id ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved === link.id ? "Saved" : "Save"}
                  </button>

                  <button
                    onClick={() => removeLink(link.id)}
                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Platform"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className={`h-1.5 ${link.isActive ? "bg-emerald-400" : "bg-slate-100"} transition-colors`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
