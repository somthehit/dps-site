"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-8">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Something went wrong!</h1>
      <p className="text-slate-500 max-w-md mb-10">
        An unexpected error occurred in the administrative panel. 
        {error.message && <span className="block mt-2 font-mono text-xs text-red-500">{error.message}</span>}
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-brand-700 hover:bg-brand-800 gap-2 px-8 py-6 rounded-2xl font-bold"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </Button>
        <Link href="/admin">
          <Button variant="outline" className="gap-2 px-8 py-6 rounded-2xl font-bold border-slate-200">
            <Home className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
