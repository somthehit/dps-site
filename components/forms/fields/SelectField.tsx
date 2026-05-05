"use client";

interface Option { label: string; labelNe?: string; value: string }

interface SelectFieldProps {
  fieldName: string;
  fieldType: "dropdown" | "radio" | "checkbox" | "multiselect";
  label: string;
  labelNe?: string | null;
  helpText?: string | null;
  required?: boolean;
  options?: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export default function SelectField({
  fieldName, fieldType, label, labelNe, helpText,
  required, options = [], value, onChange, error,
}: SelectFieldProps) {
  const ring = "focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const border = `border border-slate-200 rounded-xl ${error ? "border-red-400" : ""}`;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {fieldType === "dropdown" && (
        <select
          id={fieldName}
          value={Array.isArray(value) ? value[0] : (value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${border} bg-white px-4 py-2.5 text-sm text-slate-800 ${ring}`}
        >
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {fieldType === "multiselect" && (
        <select
          id={fieldName}
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange(selected);
          }}
          className={`w-full ${border} bg-white px-3 py-2 text-sm text-slate-800 ${ring} min-h-[120px]`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {fieldType === "radio" && (
        <div className="space-y-2">
          {options.map((o) => (
            <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={fieldName}
                value={o.value}
                checked={(Array.isArray(value) ? value[0] : value) === o.value}
                onChange={() => onChange(o.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-emerald-700">{o.label}</span>
              {o.labelNe && <span className="text-xs text-slate-400">({o.labelNe})</span>}
            </label>
          ))}
        </div>
      )}

      {fieldType === "checkbox" && (
        <div className="space-y-2">
          {options.map((o) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  value={o.value}
                  checked={checked}
                  onChange={() => {
                    const next = checked ? arr.filter((v) => v !== o.value) : [...arr, o.value];
                    onChange(next);
                  }}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-emerald-700">{o.label}</span>
                {o.labelNe && <span className="text-xs text-slate-400">({o.labelNe})</span>}
              </label>
            );
          })}
        </div>
      )}

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
