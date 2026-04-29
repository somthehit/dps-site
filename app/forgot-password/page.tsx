"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Mail, Loader2, CheckCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email address required"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link. Please try again.");
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Link Sent!</h1>
          <p className="text-slate-500 mb-2">
            We&apos;ve sent a password reset link to your email address.
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-slate-400 mb-6">पासवर्ड रिसेट लिङ्क तपाईंको इमेलमा पठाइएको छ।</p>
          <Link href="/login">
            <Button className="w-full h-12 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-2xl">
              Back to Login / लगइनमा फर्कनुहोस्
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login / लगइनमा फर्कनुहोस्
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
          <p className="text-slate-500">पासवर्ड बिर्सनुभयो?</p>
          <p className="text-sm text-slate-400 mt-2">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            आफ्नो इमेल ठेगाना प्रविष्ट गर्नुहोस् र हामी तपाईंलाई पासवर्ड रिसेट गर्न लिङ्क पठाउनेछौं।
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold">
              Email Address / इमेल ठेगाना
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="h-14 pl-12 border-slate-200 rounded-2xl"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
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
              "Send Reset Link / रिसेट लिङ्क पठाउनुहोस्"
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Remember your password? / पासवर्ड सम्झनुहुन्छ?{" "}
            <Link href="/login" className="text-brand-700 font-bold hover:underline">
              Login here / यहाँ लगइन गर्नुहोस्
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
