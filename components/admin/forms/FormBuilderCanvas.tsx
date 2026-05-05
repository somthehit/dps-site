"use client";

import { useState, useRef } from "react";
import {
  GripVertical, Trash2, Settings2, ChevronUp, ChevronDown,
  Eye, EyeOff, Star, Copy, Plus,
} from "lucide-react";

export type FieldConfig = {
  id: string;
  fieldName: string;
  fieldType: string;
  label: string;
  labelNe?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  isHidden: boolean;
  isReadonly: boolean;
  defaultValue?: string | null;
  optionsJson?: { label: string; labelNe?: string; value: string }[] | null;
  validationJson?: Record<string, unknown> | null;
  conditionalLogicJson?: Record<string, unknown> | null;
  permissionsJson?: Record<string, unknown> | null;
  sortOrder: number;
  stepId?: string | null;
};

interface FormBuilderCanvasProps {
  fields: FieldConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onToggleRequired: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const FIELD_TYPE_ICONS: Record<string, string> = {
  text: "Aa", email: "✉", phone: "📞", number: "#", password: "🔒", textarea: "¶",
  dropdown: "▾", radio: "◉", checkbox: "☑", multiselect: "☑+",
  date: "📅", time: "⏰", datetime: "📅⏰",
  file: "📎", image: "🖼", document: "📄",
  currency: "रू", address: "🏠", gps: "📍", signature: "✍", url: "🔗", color: "🎨",
  member_selector: "👤", product_selector: "📦", loan_selector: "💰",
  saving_selector: "🏦", share_selector: "📊",
};

export default function FormBuilderCanvas({
  fields, selectedId, onSelect, onDelete,
  onReorder, onToggleRequired, onToggleHidden, onDuplicate,
}: FormBuilderCanvasProps) {
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  if (fields.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
        <Plus className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium">Drag fields here from the left panel</p>
        <p className="text-sm mt-1 opacity-70">or click a field type to add it</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field, idx) => {
        const isSelected = selectedId === field.id;
        const icon = FIELD_TYPE_ICONS[field.fieldType] ?? "?";

        return (
          <div
            key={field.id}
            draggable
            onDragStart={() => { dragId.current = field.id; }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(field.id); }}
            onDragLeave={() => setDragOver(null)}
            onDragEnd={() => { dragId.current = null; setDragOver(null); }}
            onClick={() => onSelect(field.id)}
            className={`
              relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer
              transition-all group
              ${isSelected
                ? "border-emerald-400 bg-emerald-50 shadow-md"
                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"}
              ${dragOver === field.id ? "border-emerald-300 scale-[1.01]" : ""}
              ${field.isHidden ? "opacity-60" : ""}
            `}
          >
            {/* Drag handle */}
            <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Field type icon */}
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm shrink-0">
              {icon}
            </div>

            {/* Field info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-800 truncate">{field.label}</span>
                {field.isRequired && (
                  <span className="text-red-500 text-xs">*</span>
                )}
                {field.isHidden && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Hidden</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">{field.fieldName}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">
                  {field.fieldType}
                </span>
              </div>
            </div>

            {/* Sort order badge */}
            <span className="text-xs text-slate-300 font-mono shrink-0">#{idx + 1}</span>

            {/* Action buttons — show on hover/select */}
            <div className={`flex items-center gap-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onReorder(field.id, "up"); }}
                disabled={idx === 0}
                title="Move up"
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="w-3 h-3 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onReorder(field.id, "down"); }}
                disabled={idx === fields.length - 1}
                title="Move down"
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleRequired(field.id); }}
                title={field.isRequired ? "Make optional" : "Make required"}
                className={`p-1.5 rounded-lg transition-colors ${field.isRequired ? "text-red-500 hover:bg-red-50" : "text-slate-400 hover:bg-slate-100"}`}
              >
                <Star className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleHidden(field.id); }}
                title={field.isHidden ? "Show field" : "Hide field"}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                {field.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
                title="Duplicate field"
                className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                title="Delete field"
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-full" />
            )}
          </div>
        );
      })}
    </div>
  );
}
