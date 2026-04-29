"use client";

import { useState } from "react";
import SettingsForm from "./SettingsForm";
import HeroManagerClient from "@/app/admin/hero/HeroManagerClient";
import AboutManager from "./AboutManager";

export default function SettingsTabs({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<"general" | "hero" | "about">("general");

  return (
    <div>
      <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab("general")}
          className={`pb-4 font-bold text-sm transition-colors ${activeTab === 'general' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          General Settings
        </button>
        <button 
          onClick={() => setActiveTab("about")}
          className={`pb-4 font-bold text-sm transition-colors ${activeTab === 'about' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          About Us Page
        </button>
        <button 
          onClick={() => setActiveTab("hero")}
          className={`pb-4 font-bold text-sm transition-colors ${activeTab === 'hero' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Hero Experience Manager
        </button>
      </div>

      {activeTab === "general" && (
        <div className="max-w-3xl">
          <SettingsForm initialSettings={initialSettings} />
        </div>
      )}
      {activeTab === "about" && (
        <AboutManager initialSettings={initialSettings} />
      )}
      {activeTab === "hero" && (
        <div>
          <HeroManagerClient />
        </div>
      )}
    </div>
  );
}
