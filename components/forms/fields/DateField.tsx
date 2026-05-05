"use client";

interface DateFieldProps {
  fieldName: string;
  fieldType: "date" | "time" | "datetime";
  label: string;
  labelNe?: string | null;
  helpText?: string | null;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function DateField({
  fieldName, fieldType, label, labelNe, helpText,
  required, value, onChange, error,
}: DateFieldProps) {
  const inputType =
    fieldType === "date" ? "date" :
    fieldType === "time" ? "time" : "datetime-local";

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldName} className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={fieldName}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          "w-full border rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white " +
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all " +
          (error ? "border-red-400" : "border-slate-200")
        }
      />
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
