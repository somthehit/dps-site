"use client";

import { Plus } from "lucide-react";

const FIELD_GROUPS = [
  {
    label: "Basic Inputs",
    fields: [
      { type: "text", label: "Text", icon: "Aa" },
      { type: "number", label: "Number", icon: "#" },
      { type: "email", label: "Email", icon: "✉" },
      { type: "phone", label: "Phone", icon: "📞" },
      { type: "textarea", label: "Textarea", icon: "¶" },
      { type: "password", label: "Password", icon: "🔒" },
    ],
  },
  {
    label: "Selection",
    fields: [
      { type: "dropdown", label: "Dropdown", icon: "▾" },
      { type: "radio", label: "Radio", icon: "◉" },
      { type: "checkbox", label: "Checkbox", icon: "☑" },
      { type: "multiselect", label: "Multi-select", icon: "☑+" },
    ],
  },
  {
    label: "Date & Time",
    fields: [
      { type: "date", label: "Date", icon: "📅" },
      { type: "time", label: "Time", icon: "⏰" },
      { type: "datetime", label: "Date & Time", icon: "📅⏰" },
    ],
  },
  {
    label: "Uploads",
    fields: [
      { type: "file", label: "File Upload", icon: "📎" },
      { type: "image", label: "Image Upload", icon: "🖼" },
      { type: "document", label: "Document", icon: "📄" },
    ],
  },
  {
    label: "Advanced",
    fields: [
      { type: "currency", label: "Currency (रू)", icon: "रू" },
      { type: "address", label: "Address", icon: "🏠" },
      { type: "gps", label: "GPS Location", icon: "📍" },
      { type: "signature", label: "Signature", icon: "✍" },
      { type: "url", label: "URL", icon: "🔗" },
      { type: "color", label: "Color Picker", icon: "🎨" },
    ],
  },
  {
    label: "Cooperative Fields",
    fields: [
      { type: "member_selector", label: "Member Selector", icon: "👤" },
      { type: "loan_selector", label: "Loan Selector", icon: "💰" },
      { type: "saving_selector", label: "Saving Account", icon: "🏦" },
      { type: "share_selector", label: "Share Selector", icon: "📊" },
    ],
  },
];

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="space-y-5">
      {FIELD_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.fields.map((field) => (
              <button
                key={field.type}
                type="button"
                onClick={() => onAddField(field.type)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-white hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all group text-left"
              >
                <span className="text-base leading-none shrink-0">{field.icon}</span>
                <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-700 leading-tight">
                  {field.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
