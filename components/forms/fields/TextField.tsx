"use client";

interface TextFieldProps {
  fieldName: string;
  fieldType: "text" | "email" | "phone" | "number" | "password" | "textarea" | "url";
  label: string;
  labelNe?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: string | null;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function TextField({
  fieldName, fieldType, label, labelNe, placeholder, helpText,
  required, readonly, value, onChange, error,
}: TextFieldProps) {
  const inputType =
    fieldType === "textarea" ? undefined :
    fieldType === "phone" ? "tel" :
    fieldType === "url" ? "url" :
    fieldType === "number" ? "number" :
    fieldType === "password" ? "password" :
    fieldType === "email" ? "email" : "text";

  const base =
    "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 " +
    "bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 " +
    "focus:ring-emerald-500 focus:border-emerald-500 transition-all " +
    (readonly ? "bg-slate-50 text-slate-500 cursor-not-allowed " : "") +
    (error ? "border-red-400 focus:ring-red-400 " : "");

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldName} className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldType === "textarea" ? (
        <textarea
          id={fieldName}
          name={fieldName}
          rows={4}
          className={base + "resize-y"}
          placeholder={placeholder ?? ""}
          readOnly={readonly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={fieldName}
          name={fieldName}
          type={inputType}
          className={base}
          placeholder={placeholder ?? ""}
          readOnly={readonly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
