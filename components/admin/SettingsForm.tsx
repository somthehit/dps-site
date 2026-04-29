"use client";
import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}

const FIELD_GROUPS: {
  group: string;
  label: string;
  color: string;
  fields: Field[];
}[] = [
  {
    group: "contact",
    label: "Contact Information",
    color: "border-brand-500",
    fields: [
      { key: "phone", label: "Phone Number", placeholder: "+977-9805791785" },
      { key: "email", label: "Email Address", placeholder: "dps.cop724@gmail.com" },
      { key: "address_en", label: "Address (English)", placeholder: "Gauriganga - 01, Kailali" },
      { key: "address_ne", label: "Address (Nepali)", placeholder: "गौरीगंगा - ०१, कैलाली" },
      { key: "latitude", label: "Map Latitude", placeholder: "28.6139" },
      { key: "longitude", label: "Map Longitude", placeholder: "77.2090" },
      { key: "google_maps_url", label: "Google Maps URL", placeholder: "https://maps.google.com/..." },
    ],
  },
  {
    group: "office_hours",
    label: "Office Hours",
    color: "border-amber-500",
    fields: [
      { key: "office_hours", label: "Office Hours Text", placeholder: "Sun - Fri: 10:00 AM - 5:00 PM" },
    ],
  },
  {
    group: "branding",
    label: "Branding & Identity",
    color: "border-violet-500",
    fields: [
      { key: "site_title_en", label: "Site Title (English)", placeholder: "Dipshikha Krishi Sahakari Sanstha Ltd." },
      { key: "site_title_ne", label: "Site Title (Nepali)", placeholder: "दिपशिखा कृषि सहकारी संस्था लि." },
      { key: "slogan_en", label: "Slogan (English)", placeholder: "Together for Sustainable Growth" },
      { key: "slogan_ne", label: "Slogan (Nepali)", placeholder: "दिगो वृद्धिको लागि सहकार्य" },
      { key: "estb_year", label: "Establishment Year (BS)", placeholder: "2061" },
    ],
  },
  {
    group: "about",
    label: "About Section",
    color: "border-blue-500",
    fields: [
      { key: "about_bg_image", label: "About Section Background", type: "file" },
      { key: "about_en", label: "About Text (English)", placeholder: "Empowering our community...", textarea: true },
      { key: "about_ne", label: "About Text (Nepali)", placeholder: "२०६९ सालदेखि...", textarea: true },
    ],
  },
];

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialSettings);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const secret = typeof window !== "undefined"
    ? (document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? "")
    : "";

  const saveGroup = async (group: string, fields: Field[]) => {
    setSaving(group);
    for (const { key } of fields) {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ key, value: values[key] ?? "", group }),
      });
    }
    setSaving(null);
    setSaved(group);
    setTimeout(() => setSaved(null), 3000);
  };

  return (
    <div className="space-y-8">
      {FIELD_GROUPS.map(({ group, label, color, fields }) => (
        <div key={group} className={`bg-white rounded-2xl border-l-4 ${color} shadow-sm overflow-hidden`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">{label}</h2>
            <button
              onClick={() => saveGroup(group, fields)}
              disabled={saving === group}
              className="flex items-center gap-2 px-5 py-2 bg-brand-700 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-all disabled:opacity-60"
            >
              {saved === group ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> {saving === group ? "Saving..." : "Save"}</>
              )}
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(({ key, label: fieldLabel, placeholder, textarea, type }) => (
              <div key={key} className={textarea ? "md:col-span-2" : ""}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {fieldLabel}
                </label>
                {textarea ? (
                  <textarea
                    rows={3}
                    value={values[key] ?? ""}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all resize-none text-slate-800"
                  />
                ) : type === "file" ? (
                  <div>
                    {values[key] && (
                      <div className="mb-2 w-32 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={values[key]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSaving(group); // show loading state
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setValues({ ...values, [key]: data.url });
                            }
                          } catch (err) {
                            console.error("Upload failed", err);
                          }
                          setSaving(null);
                        }
                      }}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 outline-none transition-all text-slate-800"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={values[key] ?? ""}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all text-slate-800"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
