/** Allowed MIME types per field type */
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  file: ["image/jpeg", "image/png", "image/webp", "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

export const DEFAULT_MAX_FILE_SIZE_MB = 5;

export type ValidationConfig = {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  patternMessage?: string;
  maxSizeMb?: number;
  allowedMimeTypes?: string[];
};

export type ValidationError = { field: string; message: string };

/** Validate a single field value against its config */
export function validateField(
  fieldName: string,
  fieldType: string,
  value: unknown,
  isRequired: boolean,
  config?: ValidationConfig | null
): ValidationError | null {
  const empty =
    value === null || value === undefined || value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (isRequired && empty) {
    return { field: fieldName, message: "यो फिल्ड अनिवार्य छ / This field is required" };
  }
  if (empty) return null;

  const str = typeof value === "string" ? value : String(value);

  if (config?.minLength && str.length < config.minLength)
    return { field: fieldName, message: `Minimum ${config.minLength} characters required` };

  if (config?.maxLength && str.length > config.maxLength)
    return { field: fieldName, message: `Maximum ${config.maxLength} characters allowed` };

  if (fieldType === "number" || fieldType === "currency") {
    const num = parseFloat(str);
    if (isNaN(num)) return { field: fieldName, message: "Valid number required" };
    if (config?.minValue !== undefined && num < config.minValue)
      return { field: fieldName, message: `Minimum value: ${config.minValue}` };
    if (config?.maxValue !== undefined && num > config.maxValue)
      return { field: fieldName, message: `Maximum value: ${config.maxValue}` };
  }

  if (fieldType === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(str))
      return { field: fieldName, message: "Valid email address required" };
  }

  if (fieldType === "phone") {
    const phoneRegex = /^[0-9+\-\s]{7,15}$/;
    if (!phoneRegex.test(str))
      return { field: fieldName, message: "Valid phone number required" };
  }

  if (config?.pattern) {
    try {
      const regex = new RegExp(config.pattern);
      if (!regex.test(str))
        return { field: fieldName, message: config.patternMessage ?? "Invalid format" };
    } catch {
      // invalid regex — skip
    }
  }

  return null;
}

/** Validate MIME type from file header (server-side) */
export function validateMime(
  mimeType: string,
  fieldType: string,
  allowedTypes?: string[]
): boolean {
  const allowed = allowedTypes ?? ALLOWED_MIME_TYPES[fieldType] ?? ALLOWED_MIME_TYPES.file;
  return allowed.includes(mimeType);
}
