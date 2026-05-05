"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "loan", label: "Loan / ऋण" },
  { value: "savings", label: "Savings / बचत" },
  { value: "fertilizer", label: "Fertilizer / मल" },
  { value: "member_services", label: "Member Services / सदस्य सेवा" },
  { value: "complaint", label: "Complaint / गुनासो" },
  { value: "hr", label: "HR" },
  { value: "share", label: "Share / शेयर" },
  { value: "custom", label: "Custom / अन्य" },
];

export default function NewFormClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Form name is required"); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || autoSlug(name), description, category, isMultiStep }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create form");
      router.push(`/admin/forms/${data.form.id}/builder`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create form");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Form</h1>
        <p className="text-slate-500 mt-1">Set up the basics, then use the builder to add fields</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Form Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }}
              placeholder="e.g. Loan Application Form"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Slug</label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200">/forms/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(autoSlug(e.target.value))}
                placeholder="loan-application"
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this form's purpose…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              id="multistep"
              type="checkbox"
              checked={isMultiStep}
              onChange={(e) => setIsMultiStep(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
            />
            <label htmlFor="multistep" className="text-sm font-medium text-slate-700 cursor-pointer">
              Multi-step form (with page sections & progress bar)
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Creating…" : "Create & Open Builder"}
          </button>
        </form>
      </div>
    </div>
  );
}
