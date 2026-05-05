"use client";

import { useRef, useState } from "react";
import { Upload, X, File, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FileUploadFieldProps {
  fieldName: string;
  label: string;
  labelNe?: string;
  required?: boolean;
  helpText?: string;
  fieldType?: "file" | "image" | "document";
  maxSizeMb?: number;
  allowedMimeTypes?: string[];
  value?: { fileName: string; publicUrl: string; storagePath: string } | null;
  onChange: (value: { fileName: string; publicUrl: string; storagePath: string; mimeType: string; sizeBytes: number } | null) => void;
  error?: string;
}

const MIME_MAP: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  file: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};

export default function FileUploadField({
  fieldName, label, labelNe, required, helpText, fieldType = "file",
  maxSizeMb = 5, allowedMimeTypes, value, onChange, error,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const allowed = allowedMimeTypes ?? MIME_MAP[fieldType] ?? MIME_MAP.file;

  const handleFile = async (file: File) => {
    setUploadError(null);
    if (!allowed.includes(file.type)) {
      setUploadError(`Invalid file type. Allowed: ${allowed.join(", ")}`);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setUploadError(`File too large. Maximum: ${maxSizeMb}MB`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `form-uploads/${Date.now()}-${fieldName}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("form-uploads")
        .upload(path, file, { contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("form-uploads").getPublicUrl(path);

      onChange({
        fileName: file.name,
        publicUrl,
        storagePath: path,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {labelNe && <span className="ml-2 text-slate-400 font-normal text-xs">({labelNe})</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!value ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Click or drag to upload</p>
          <p className="text-xs text-slate-400 mt-1">
            Max {maxSizeMb}MB · {allowed.map((m) => m.split("/")[1].toUpperCase()).join(", ")}
          </p>
          {uploading && <p className="text-xs text-emerald-600 mt-2 animate-pulse">Uploading…</p>}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <File className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{value.fileName}</p>
          </div>
          <div className="flex gap-2">
            <a href={value.publicUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
              <Eye className="w-4 h-4 text-slate-500" />
            </a>
            <button type="button" onClick={() => onChange(null)}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={allowed.join(",")}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
      {(error || uploadError) && <p className="text-xs text-red-500">{error ?? uploadError}</p>}
    </div>
  );
}
