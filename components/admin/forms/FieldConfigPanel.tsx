"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FieldConfig } from "./FormBuilderCanvas";
import type { StepConfig } from "@/app/admin/forms/[id]/builder/BuilderClient";

interface FieldConfigPanelProps {
  field: FieldConfig;
  onUpdate: (id: string, updates: Partial<FieldConfig>) => void;
  steps: StepConfig[];
}

const HAS_OPTIONS = ["dropdown", "radio", "checkbox", "multiselect"];

export default function FieldConfigPanel({ field, onUpdate, steps }: FieldConfigPanelProps) {
  const [newOptionLabel, setNewOptionLabel] = useState("");

  const update = (patch: Partial<FieldConfig>) => onUpdate(field.id, patch);

  const addOption = () => {
    if (!newOptionLabel.trim()) return;
    const val = newOptionLabel.trim().toLowerCase().replace(/\s+/g, "_");
    const opts = [...(field.optionsJson ?? []), { label: newOptionLabel.trim(), value: val }];
    update({ optionsJson: opts });
    setNewOptionLabel("");
  };

  const removeOption = (i: number) => {
    const opts = [...(field.optionsJson ?? [])];
    opts.splice(i, 1);
    update({ optionsJson: opts });
  };

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="flex-1">
          <p className="font-bold text-slate-900 capitalize">{field.fieldType} Field</p>
          <p className="text-xs text-slate-400 font-mono">{field.fieldName}</p>
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Label (English)</label>
        <input value={field.label} onChange={(e) => update({ label: e.target.value })} className={inp} />
      </div>

      {/* Label Nepali */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Label (नेपाली)</label>
        <input value={field.labelNe ?? ""} onChange={(e) => update({ labelNe: e.target.value })} className={inp} />
      </div>

      {/* Field Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Field Name (key)</label>
        <input
          value={field.fieldName}
          onChange={(e) => update({ fieldName: e.target.value.replace(/\s+/g, "_").toLowerCase() })}
          className={inp + " font-mono"}
        />
        <p className="text-[10px] text-slate-400 mt-1">Used as the data key. No spaces.</p>
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Placeholder</label>
        <input value={field.placeholder ?? ""} onChange={(e) => update({ placeholder: e.target.value })} className={inp} />
      </div>

      {/* Help text */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Help Text</label>
        <textarea value={field.helpText ?? ""} onChange={(e) => update({ helpText: e.target.value })} rows={2} className={inp + " resize-none"} />
      </div>

      {/* Step Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assigned Step</label>
        <select 
          value={field.stepId ?? ""} 
          onChange={(e) => update({ stepId: e.target.value || null })} 
          className={inp}
        >
          <option value="">No Step (Root)</option>
          {steps.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 mt-1">Move this field to a different step.</p>
      </div>

      {/* Options (for selection fields) */}
      {HAS_OPTIONS.includes(field.fieldType) && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Options</label>
          <div className="space-y-1.5 mb-2">
            {(field.optionsJson ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt.label}
                  onChange={(e) => {
                    const opts = [...(field.optionsJson ?? [])];
                    opts[i] = { ...opts[i], label: e.target.value };
                    update({ optionsJson: opts });
                  }}
                  className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 font-mono">{opt.value}</span>
                <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
              placeholder="Add option…"
              className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button type="button" onClick={addOption}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Validation */}
      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Validation</p>
        {["number", "currency"].includes(field.fieldType) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Min Value</label>
              <input type="number" placeholder="0"
                value={(field.validationJson as Record<string, number>)?.minValue ?? ""}
                onChange={(e) => update({ validationJson: { ...field.validationJson, minValue: Number(e.target.value) } })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Max Value</label>
              <input type="number" placeholder="∞"
                value={(field.validationJson as Record<string, number>)?.maxValue ?? ""}
                onChange={(e) => update({ validationJson: { ...field.validationJson, maxValue: Number(e.target.value) } })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        )}
        {["text", "textarea", "email", "phone"].includes(field.fieldType) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Min Length</label>
              <input type="number" placeholder="0"
                value={(field.validationJson as Record<string, number>)?.minLength ?? ""}
                onChange={(e) => update({ validationJson: { ...field.validationJson, minLength: Number(e.target.value) } })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">Max Length</label>
              <input type="number" placeholder="∞"
                value={(field.validationJson as Record<string, number>)?.maxLength ?? ""}
                onChange={(e) => update({ validationJson: { ...field.validationJson, maxLength: Number(e.target.value) } })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        )}
        {["file", "image", "document"].includes(field.fieldType) && (
          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Max Size (MB)</label>
            <input type="number" placeholder="5"
              value={(field.validationJson as Record<string, number>)?.maxSizeMb ?? ""}
              onChange={(e) => update({ validationJson: { ...field.validationJson, maxSizeMb: Number(e.target.value) } })}
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-2.5">
        {([
          { key: "isRequired", label: "Required field", desc: "Members must fill this" },
          { key: "isHidden", label: "Hidden", desc: "Not shown to members" },
          { key: "isReadonly", label: "Read-only", desc: "Members cannot edit" },
        ] as const).map(({ key, label, desc }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={field[key] as boolean}
              onChange={(e) => update({ [key]: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Permissions */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-2">Permissions</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(field.permissionsJson as Record<string, boolean>)?.readonlyAfterSubmit ?? false}
            onChange={(e) => update({ permissionsJson: { ...field.permissionsJson, readonlyAfterSubmit: e.target.checked } })}
            className="w-4 h-4 rounded text-amber-600"
          />
          <span className="text-xs text-amber-800 font-medium">Read-only after submission</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={(field.permissionsJson as Record<string, boolean>)?.adminOnly ?? false}
            onChange={(e) => update({ permissionsJson: { ...field.permissionsJson, adminOnly: e.target.checked } })}
            className="w-4 h-4 rounded text-amber-600"
          />
          <span className="text-xs text-amber-800 font-medium">Admin-only field</span>
        </label>
      </div>
    </div>
  );
}
