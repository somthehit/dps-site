"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false);
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token, email]);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token || !email) {
      setError("Invalid reset link.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password. Please try again.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful!</h1>
        <p className="text-slate-500 mb-2">Your password has been reset successfully.</p>
        <p className="text-sm text-slate-400 mb-2">पासवर्ड सफलतापूर्वक रिसेट गरियो।</p>
        <p className="text-slate-500 mb-6">You can now login with your new password.</p>
        <Link href="/login">
          <Button className="w-full h-12 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-2xl">
            Go to Login / लगइनमा जानुहोस्
          </Button>
        </Link>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h1>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link href="/forgot-password">
          <Button className="w-full h-12 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-2xl">
            Request New Link / नयाँ लिङ्क अनुरोध गर्नुहोस्
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Your Password</h1>
        <p className="text-slate-500">आफ्नो पासवर्ड रिसेट गर्नुहोस्</p>
        <p className="text-sm text-slate-400 mt-2">
          Enter your new password below.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          तल आफ्नो नयाँ पासवर्ड प्रविष्ट गर्नुहोस्।
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-bold">
              New Password / नयाँ पासवर्ड
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 pl-12 pr-12 border-slate-200 rounded-2xl"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-bold">
              Confirm Password / पासवर्ड पुष्टि गर्नुहोस्
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 pl-12 pr-12 border-slate-200 rounded-2xl"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-2xl"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            "Reset Password / पासवर्ड रिसेट गर्नुहोस्"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={
        <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
