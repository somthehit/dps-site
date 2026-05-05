"use client";

const STATUS_CONFIG = {
  draft:       { label: "Draft / मस्यौदा",      color: "bg-slate-100 text-slate-600",    dot: "bg-slate-400" },
  submitted:   { label: "Submitted / पेश",        color: "bg-blue-100 text-blue-700",      dot: "bg-blue-500" },
  pending:     { label: "Pending / विचाराधीन",    color: "bg-amber-100 text-amber-700",    dot: "bg-amber-500" },
  approved:    { label: "Approved / स्वीकृत",     color: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500 animate-pulse" },
  rejected:    { label: "Rejected / अस्वीकृत",   color: "bg-red-100 text-red-700",        dot: "bg-red-500" },
  processing:  { label: "Processing / प्रक्रिया", color: "bg-violet-100 text-violet-700",  dot: "bg-violet-500" },
  completed:   { label: "Completed / सम्पन्न",    color: "bg-teal-100 text-teal-700",      dot: "bg-teal-500" },
} as const;

type Status = keyof typeof STATUS_CONFIG;

interface SubmissionStatusProps {
  status: Status | string;
  size?: "sm" | "md";
}

export default function SubmissionStatus({ status, size = "md" }: SubmissionStatusProps) {
  const cfg = STATUS_CONFIG[status as Status] ?? {
    label: status,
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold
      ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}
      ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
