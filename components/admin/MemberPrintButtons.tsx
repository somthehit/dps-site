"use client";

import { Printer, Download } from "lucide-react";

export default function MemberPrintButtons() {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.print()}
        className="flex items-center justify-center gap-2 px-6 h-12 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 hover:text-brand-600 transition-all shadow-sm"
      >
        <Printer className="w-5 h-5" />
        Print Form
      </button>

      <button
        onClick={() => alert("Export feature coming soon!")}
        className="flex items-center justify-center gap-2 px-6 h-12 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
      >
        <Download className="w-5 h-5" />
        Export
      </button>
    </div>
  );
}
