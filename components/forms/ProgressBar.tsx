"use client";

interface Step { title: string; titleNe?: string | null }

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const pct = steps.length > 1 ? Math.round((currentStep / (steps.length - 1)) * 100) : 100;

  return (
    <div className="mb-8">
      {/* Step Labels */}
      <div className="flex justify-between mb-3">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center max-w-[80px]">
            <div
              className={
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all " +
                (i < currentStep
                  ? "bg-emerald-600 text-white"
                  : i === currentStep
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                  : "bg-slate-200 text-slate-500")
              }
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={
                "text-[10px] mt-1.5 font-medium leading-tight " +
                (i === currentStep ? "text-emerald-700" : "text-slate-400")
              }
            >
              {step.title}
            </span>
            {step.titleNe && (
              <span className="text-[9px] text-slate-300 leading-tight">{step.titleNe}</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress track */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-400">Step {currentStep + 1} of {steps.length}</span>
        <span className="text-xs text-emerald-600 font-semibold">{pct}% complete</span>
      </div>
    </div>
  );
}
