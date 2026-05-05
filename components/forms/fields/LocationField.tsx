"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface LocationFieldProps {
  fieldName: string;
  label: string;
  labelNe?: string | null;
  helpText?: string | null;
  required?: boolean;
  value: { lat: number; lng: number; address?: string } | null;
  onChange: (value: { lat: number; lng: number; address?: string } | null) => void;
  error?: string;
}

export default function LocationField({
  label, labelNe, helpText, required, value, onChange, error,
}: LocationFieldProps) {
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const capture = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode via a free API (no key required)
        let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          if (data.display_name) address = data.display_name;
        } catch {/* ignore */}
        onChange({ lat, lng, address });
        setLoading(false);
      },
      (err) => {
        setLocError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        <button
          type="button"
          onClick={capture}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {loading ? "Detecting location…" : "Capture GPS Location"}
        </button>

        {value && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
            <p className="font-medium text-emerald-800">
              📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </p>
            {value.address && <p className="text-emerald-700 text-xs mt-1">{value.address}</p>}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-red-500 mt-2 hover:underline"
            >
              Clear location
            </button>
          </div>
        )}
      </div>

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {(error || locError) && <p className="text-xs text-red-500">{error ?? locError}</p>}
    </div>
  );
}
