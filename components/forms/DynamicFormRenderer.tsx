"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send, Save, AlertCircle } from "lucide-react";
import { isFieldVisible } from "@/lib/forms/conditional-logic";
import ProgressBar from "./ProgressBar";
import TextField from "./fields/TextField";
import SelectField from "./fields/SelectField";
import DateField from "./fields/DateField";
import FileUploadField from "./fields/FileUploadField";
import SignatureField from "./fields/SignatureField";
import LocationField from "./fields/LocationField";
import CurrencyField from "./fields/CurrencyField";

type FieldType = {
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
  conditionalLogicJson?: {
    action: "show" | "hide";
    operator: "AND" | "OR";
    conditions: { fieldName: string; operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_empty" | "is_empty"; value: string }[];
  } | null;
  permissionsJson?: Record<string, unknown> | null;
  sortOrder: number;
  stepId?: string | null;
};

type StepType = {
  id: string;
  title: string;
  titleNe?: string | null;
  description?: string | null;
  stepOrder: number;
};

interface DynamicFormRendererProps {
  formId: string;
  formSlug: string;
  formName: string;
  formCategory: string;
  isMultiStep: boolean;
  fields: FieldType[];
  steps: StepType[];
  memberId?: string;
  memberEmail?: string;
  /** If provided, renders in read-only review mode */
  readOnly?: boolean;
  existingValues?: Record<string, unknown>;
}

const DRAFT_KEY = (slug: string, uid: string) => `dps-form-draft-${slug}-${uid}`;

export default function DynamicFormRenderer({
  formId, formSlug, formName, formCategory,
  isMultiStep, fields, steps,
  memberId, memberEmail, readOnly = false, existingValues,
}: DynamicFormRendererProps) {
  const router = useRouter();

  // Initialize values from defaults or existing
  const initValues = () => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => {
      const defaultValue = ["checkbox", "multiselect"].includes(f.fieldType) ? [] : (f.defaultValue ?? "");
      init[f.fieldName] = existingValues?.[f.fieldName] ?? defaultValue;
    });
    return init;
  };

  const [values, setValues] = useState<Record<string, unknown>>(initValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionCode, setSubmissionCode] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

  // ── Offline draft autosave ────────────────────────────────────────────────
  const draftKey = DRAFT_KEY(formSlug, memberId ?? "guest");

  // Restore draft on mount
  useEffect(() => {
    if (readOnly || existingValues) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setValues(parsed);
          setDraftRestored(true);
        }
      }
    } catch {/* ignore */}
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    if (readOnly) return;
    const interval = setInterval(() => {
      try { localStorage.setItem(draftKey, JSON.stringify(values)); }
      catch {/* quota exceeded — ignore */}
    }, 30_000);
    return () => clearInterval(interval);
  }, [values, draftKey, readOnly]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(draftKey); } catch {/* ignore */}
  }, [draftKey]);

  // ── Field visibility ──────────────────────────────────────────────────────
  const isVisible = (field: FieldType) => {
    if (field.isHidden) return false;
    return isFieldVisible(field.conditionalLogicJson, values);
  };

  // ── Step-aware field list ─────────────────────────────────────────────────
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const activeStepId = isMultiStep && sortedSteps.length > 0
    ? sortedSteps[currentStep]?.id
    : null;

  const visibleFields = fields
    .filter((f) => isVisible(f))
    .filter((f) => !isMultiStep || !activeStepId || f.stepId === activeStepId || !f.stepId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // ── Value update ──────────────────────────────────────────────────────────
  const setValue = (fieldName: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [fieldName]: val }));
    if (errors[fieldName]) setErrors((prev) => { const e = { ...prev }; delete e[fieldName]; return e; });
  };

  // ── Validation for current step ───────────────────────────────────────────
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    visibleFields.forEach((field) => {
      if (!field.isRequired) return;
      const val = values[field.fieldName];
      const empty = val === null || val === undefined || val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (empty) newErrors[field.fieldName] = "यो फिल्ड अनिवार्य छ / Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => Math.min(s + 1, sortedSteps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Save draft ────────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (!memberId) return;
    localStorage.setItem(draftKey, JSON.stringify(values));
    try {
      await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, memberEmail, values, isDraft: true }),
      });
    } catch {/* local draft already saved */}
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, memberEmail, values, isDraft: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errs: Record<string, string> = {};
          data.errors.forEach((e: { field: string; message: string }) => { errs[e.field] = e.message; });
          setErrors(errs);
          return;
        }
        throw new Error(data.error ?? "Submission failed");
      }

      clearDraft();
      setSubmissionCode(data.submissionCode);
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Field renderer ────────────────────────────────────────────────────────
  const renderField = (field: FieldType) => {
    const val = values[field.fieldName];
    const err = errors[field.fieldName];
    const common = {
      fieldName: field.fieldName,
      label: field.label,
      labelNe: field.labelNe ?? undefined,
      helpText: field.helpText ?? undefined,
      required: field.isRequired,
      error: err,
    };

    switch (field.fieldType) {
      case "text": case "email": case "phone": case "number":
      case "password": case "textarea": case "url":
        return (
          <TextField {...common} fieldType={field.fieldType as "text"}
            placeholder={field.placeholder} readonly={readOnly || field.isReadonly}
            value={String(val ?? "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "dropdown": case "radio": case "checkbox": case "multiselect":
        return (
          <SelectField {...common} fieldType={field.fieldType as any}
            options={field.optionsJson ?? []}
            value={(Array.isArray(val) ? val : (val as string)) ?? (["checkbox", "multiselect"].includes(field.fieldType) ? [] : "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "date": case "time": case "datetime":
        return (
          <DateField {...common} fieldType={field.fieldType as "date"}
            value={String(val ?? "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "currency":
        return (
          <CurrencyField {...common} placeholder={field.placeholder}
            value={String(val ?? "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "file": case "image": case "document":
        return (
          <FileUploadField {...common} fieldType={field.fieldType as "file"}
            maxSizeMb={(field.validationJson as Record<string, number>)?.maxSizeMb ?? 5}
            allowedMimeTypes={(field.validationJson as Record<string, string[]>)?.allowedMimeTypes}
            value={val as { fileName: string; publicUrl: string; storagePath: string } ?? null}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "signature":
        return (
          <SignatureField {...common}
            value={String(val ?? "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      case "gps":
        return (
          <LocationField {...common}
            value={val as { lat: number; lng: number; address?: string } | null}
            onChange={(v) => setValue(field.fieldName, v)} />
        );

      default:
        return (
          <TextField {...common} fieldType="text"
            placeholder={field.placeholder} value={String(val ?? "")}
            onChange={(v) => setValue(field.fieldName, v)} />
        );
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          फाराम सफलतापूर्वक पेश भयो!
        </h2>
        <p className="text-slate-500 mb-1">Form submitted successfully!</p>
        <div className="mt-6 inline-block bg-slate-100 rounded-2xl px-6 py-4">
          <p className="text-xs text-slate-500 mb-1">Your Submission ID / तपाईंको सबमिशन ID</p>
          <p className="text-2xl font-bold font-mono text-emerald-700">{submissionCode}</p>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          Save this ID to track your submission status.
        </p>
        <button
          onClick={() => router.push("/member/submissions")}
          className="mt-6 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all"
        >
          View My Submissions →
        </button>
      </div>
    );
  }

  const isLastStep = !isMultiStep || currentStep === sortedSteps.length - 1;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Draft restored banner */}
      {draftRestored && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Draft Restored / मस्यौदा पुनः लोड भयो</p>
            <p className="text-amber-700 text-xs mt-0.5">Your previous progress has been restored.</p>
          </div>
          <button type="button" onClick={() => { setValues(initValues()); setDraftRestored(false); }}
            className="ml-auto text-xs text-amber-600 hover:text-amber-800 font-medium shrink-0">
            Start fresh
          </button>
        </div>
      )}

      {/* Multi-step progress */}
      {isMultiStep && sortedSteps.length > 1 && (
        <ProgressBar steps={sortedSteps} currentStep={currentStep} />
      )}

      {/* Step header */}
      {isMultiStep && sortedSteps[currentStep] && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">{sortedSteps[currentStep].title}</h3>
          {sortedSteps[currentStep].titleNe && (
            <p className="text-sm text-slate-500">{sortedSteps[currentStep].titleNe}</p>
          )}
          {sortedSteps[currentStep].description && (
            <p className="text-sm text-slate-600 mt-1">{sortedSteps[currentStep].description}</p>
          )}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-6">
        {visibleFields.map((field) => (
          <div key={field.id}>{renderField(field)}</div>
        ))}
      </div>

      {/* Global error */}
      {submitError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Navigation buttons */}
      {!readOnly && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex gap-3">
            {isMultiStep && currentStep > 0 && (
              <button type="button" onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
          </div>

          <div className="flex gap-3 ml-auto">
            {memberId && (
              <button type="button" onClick={saveDraft}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">
                <Save className="w-4 h-4" /> Save Draft
              </button>
            )}

            {!isLastStep ? (
              <button type="button" onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all">
                {submitting ? (
                  <><span className="animate-spin">⟳</span> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Form</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
