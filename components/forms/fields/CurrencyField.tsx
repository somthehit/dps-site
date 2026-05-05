"use client";

interface CurrencyFieldProps {
  fieldName: string;
  label: string;
  labelNe?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CurrencyField({
  fieldName, label, labelNe, placeholder, helpText,
  required, value, onChange, error,
}: CurrencyFieldProps) {
  const formatted = value
    ? Number(value).toLocaleString("ne-NP", { maximumFractionDigits: 2 })
    : "";

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldName} className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 select-none">
          रू
        </span>
        <input
          id={fieldName}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0.00"}
          className={
            "w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm text-slate-800 bg-white " +
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all " +
            (error ? "border-red-400" : "border-slate-200")
          }
        />
        {formatted && value && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {formatted}
          </span>
        )}
      </div>
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
