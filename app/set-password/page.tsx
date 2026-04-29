"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pending_user_email')
    if (!pendingEmail) {
      router.push("/login")
      return
    }
    setEmail(pendingEmail)
  }, [router])

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      // Get user details from public_users
      const { data: userData, error: userError } = await supabase
        .from('public_users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        throw new Error("User data not found")
      }

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: values.password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
          }
        }
      })

      if (authError) {
        // If user already exists, try to sign in instead
        if (authError.message.includes("already registered")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: values.password,
          })
          
          if (signInError) {
            throw new Error("Unable to set password. Please contact admin.")
          }
        } else {
          throw authError
        }
      }

      // Update password_hash in public_users
      await supabase
        .from('public_users')
        .update({ password_hash: 'set' })
        .eq('email', email)

      // Clear session storage
      sessionStorage.removeItem('pending_user_email')

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Set Successfully!</h1>
          <p className="text-slate-500">Your account is ready. Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Set Your Password</h1>
          <p className="text-slate-500 text-sm">
            Your application has been approved! Create a password to access your account.
          </p>
          <p className="text-brand-700 font-medium mt-2">{email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-bold">New Password</Label>
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
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-bold">Confirm Password</Label>
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
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
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
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Set Password & Continue"}
          </Button>
        </form>
      </div>
    </div>
  )
}
