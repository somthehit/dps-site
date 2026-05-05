"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save, Eye, Globe, EyeOff, ArrowLeft, Loader2, CheckCircle, AlertCircle, Settings, Hash, Clock, Calendar,
  Trash2, Plus
} from "lucide-react";
import FieldPalette from "@/components/admin/forms/FieldPalette";
import FormBuilderCanvas, { type FieldConfig } from "@/components/admin/forms/FormBuilderCanvas";
import FieldConfigPanel from "@/components/admin/forms/FieldConfigPanel";

export type StepConfig = {
  id: string;
  title: string;
  titleNe?: string | null;
  description?: string | null;
  stepOrder: number;
};

interface BuilderPageClientProps {
  formId: string;
  initialForm: {
    id: string; name: string; slug: string; status: string;
    category: string; isMultiStep: boolean;
    startAt: string | null;
    endAt: string | null;
    submissionLimit: number | null;
  };
  initialFields: FieldConfig[];
  initialSteps: StepConfig[];
}

function generateFieldName(type: string, existing: FieldConfig[]): string {
  const base = type.replace(/[^a-z]/g, "");
  let i = 1;
  while (existing.find((f) => f.fieldName === `${base}_${i}`)) i++;
  return `${base}_${i}`;
}

export default function BuilderPageClient({ formId, initialForm, initialFields, initialSteps }: BuilderPageClientProps) {
  const router = useRouter();
  const [fields, setFields] = useState<FieldConfig[]>(initialFields);
  const [steps, setSteps] = useState<StepConfig[]>(initialSteps);
  const [activeStepId, setActiveStepId] = useState<string | null>(initialSteps[0]?.id ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [form, setForm] = useState(initialForm);

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  // ── Add field from palette ─────────────────────────────────────────────
  const addField = useCallback(async (fieldType: string) => {
    const fieldName = generateFieldName(fieldType, fields);
    const label = fieldType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    try {
      const res = await fetch(`/api/forms/${formId}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label, fieldName, fieldType,
          isRequired: false, isHidden: false, isReadonly: false,
          sortOrder: fields.length,
          stepId: activeStepId,
        }),
      });
      const data = await res.json();
      if (data.field) {
        setFields((prev) => [...prev, data.field]);
        setSelectedId(data.field.id);
      }
    } catch (err) {
      console.error("Failed to add field:", err);
    }
  }, [fields, formId, activeStepId]);

  // ── Step Actions ──────────────────────────────────────────────────────
  const addStep = async () => {
    const title = `Step ${steps.length + 1}`;
    const res = await fetch(`/api/forms/${formId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, stepOrder: steps.length }),
    });
    const data = await res.json();
    if (data.step) {
      setSteps((prev) => [...prev, data.step]);
      setActiveStepId(data.step.id);
      if (!form.isMultiStep) updateForm({ isMultiStep: true });
    }
  };

  const deleteStep = async (id: string) => {
    if (!confirm("Delete this step? Fields in this step will be moved to 'No Step'.")) return;
    await fetch(`/api/forms/${formId}/steps`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: id }),
    });
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setFields((prev) => prev.map((f) => f.stepId === id ? { ...f, stepId: null } : f));
    if (activeStepId === id) setActiveStepId(steps[0]?.id !== id ? steps[0]?.id : (steps[1]?.id ?? null));
  };

  // ── Update a field (save to DB after short debounce) ──────────────────
  const updateField = useCallback(async (id: string, updates: Partial<FieldConfig>) => {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, ...updates } : f));
    setSaveStatus("idle");

    await fetch(`/api/forms/${formId}/fields/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }, [formId]);

  // ── Delete field ──────────────────────────────────────────────────────
  const deleteField = useCallback(async (id: string) => {
    if (!confirm("Delete this field? This is a soft delete — historical submissions remain intact.")) return;
    await fetch(`/api/forms/${formId}/fields/${id}`, { method: "DELETE" });
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [formId, selectedId]);

  // ── Reorder ───────────────────────────────────────────────────────────
  const reorderField = useCallback(async (id: string, direction: "up" | "down") => {
    setFields((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((f) => f.id === id);
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      const reordered = arr.map((f, i) => ({ ...f, sortOrder: i }));

      // Persist new order
      fetch(`/api/forms/${formId}/fields/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map(({ id, sortOrder }) => ({ id, sortOrder })) }),
      });

      return reordered;
    });
  }, [formId]);

  // ── Quick toggles ─────────────────────────────────────────────────────
  const toggleRequired = useCallback((id: string) => {
    const f = fields.find((x) => x.id === id);
    if (f) updateField(id, { isRequired: !f.isRequired });
  }, [fields, updateField]);

  const toggleHidden = useCallback((id: string) => {
    const f = fields.find((x) => x.id === id);
    if (f) updateField(id, { isHidden: !f.isHidden });
  }, [fields, updateField]);

  // ── Duplicate field ───────────────────────────────────────────────────
  const duplicateField = useCallback(async (id: string) => {
    const orig = fields.find((f) => f.id === id);
    if (!orig) return;
    const newName = generateFieldName(orig.fieldType, fields);
    const res = await fetch(`/api/forms/${formId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...orig,
        id: undefined,
        fieldName: newName,
        label: `${orig.label} (Copy)`,
        sortOrder: fields.length,
      }),
    });
    const data = await res.json();
    if (data.field) {
      setFields((prev) => [...prev, data.field]);
      setSelectedId(data.field.id);
    }
  }, [fields, formId]);

  // ── Publish / unpublish ───────────────────────────────────────────────
  const updateForm = async (updates: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const togglePublish = async () => {
    setPublishing(true);
    const newStatus = form.status === "published" ? "unpublished" : "published";
    try {
      await updateForm({ status: newStatus });
    } finally {
      setPublishing(false);
    }
  };

  const isPublished = form.status === "published";

  const filteredFields = activeStepId 
    ? fields.filter(f => f.stepId === activeStepId)
    : fields;

  const activeStep = steps.find(s => s.id === activeStepId);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0 z-10">
        <Link href="/admin/forms" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:block">Forms</span>
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-slate-900 truncate">{form.name}</h1>
          <p className="text-[10px] text-slate-400">/{form.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          <Link
            href={`/admin/forms/${formId}/preview`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </Link>

          <Link
            href={`/admin/forms/${formId}/submissions`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
          >
            Submissions ({fields.length > 0 ? "…" : "0"})
          </Link>

          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isPublished
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
              isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Three-column builder layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Field palette */}
        <aside className="w-56 bg-white border-r border-slate-100 overflow-y-auto p-4 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            Add Fields
          </p>
          <FieldPalette onAddField={addField} />
        </aside>

        {/* Center — Canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Steps Toolbar */}
            <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveStepId(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${!activeStepId ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All Fields
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              {steps.map((step) => (
                <div key={step.id} className="relative flex items-center group">
                  <button 
                    onClick={() => setActiveStepId(step.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeStepId === step.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {step.title}
                  </button>
                  {activeStepId === step.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Delete step"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addStep}
                className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1 whitespace-nowrap ml-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>

            {/* Form header preview */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{activeStep ? activeStep.title : form.name}</h2>
                  <p className="text-emerald-200 text-sm mt-1">
                    {activeStep ? (activeStep.description || "Step Details") : form.category.replace(/_/g, " ").toUpperCase()}
                  </p>
                </div>
                {activeStep && (
                  <div className="flex flex-col gap-2">
                     <input 
                       className="bg-white/10 hover:bg-white/20 border border-white/20 rounded px-2 py-1 text-xs outline-none"
                       placeholder="Step Title"
                       value={activeStep.title}
                       onChange={(e) => {
                         const newSteps = steps.map(s => s.id === activeStep.id ? { ...s, title: e.target.value } : s);
                         setSteps(newSteps);
                         fetch(`/api/forms/${formId}/steps`, {
                           method: "PATCH",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ stepId: activeStep.id, title: e.target.value }),
                         });
                       }}
                     />
                  </div>
                )}
              </div>
            </div>

            <FormBuilderCanvas
              fields={filteredFields}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteField}
              onReorder={reorderField}
              onToggleRequired={toggleRequired}
              onToggleHidden={toggleHidden}
              onDuplicate={duplicateField}
            />

            <p className="text-xs text-slate-400 text-center mt-6">
              {filteredFields.length} field{filteredFields.length !== 1 ? "s" : ""} {activeStepId ? `in this step` : ""} · Click a field to configure it · Drag to reorder
            </p>
          </div>
        </main>

        {/* Right — Config panel */}
        <aside className="w-72 bg-white border-l border-slate-100 overflow-y-auto shrink-0">
          {selectedField ? (
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                Field Settings
              </p>
              <FieldConfigPanel field={selectedField} onUpdate={updateField} steps={steps} />
            </div>
          ) : (
            <div className="h-full flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-800">Form Settings</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Availability Duration
                  </label>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start Date</span>
                      <input
                        type="datetime-local"
                        value={form.startAt ? form.startAt.slice(0, 16) : ""}
                        onChange={(e) => updateForm({ startAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">End Date</span>
                      <input
                        type="datetime-local"
                        value={form.endAt ? form.endAt.slice(0, 16) : ""}
                        onChange={(e) => updateForm({ endAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Submission Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="No limit"
                      value={form.submissionLimit ?? ""}
                      onChange={(e) => updateForm({ submissionLimit: e.target.value ? parseInt(e.target.value) : null })}
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="text-xs text-slate-400 shrink-0">entries</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Form will automatically unpublished after reaching this limit.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 italic">
                    Select any field on the canvas to configure its properties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Settings2Icon() {
  return (
    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
