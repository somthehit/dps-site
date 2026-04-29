"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, User, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useTranslation } from "@/lib/i18n/useTranslation"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { SiteStat } from "@/lib/data/site-config"

const loginSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginClient({ stats = [] }: { stats?: SiteStat[] }) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch approved user from public_users (RLS should allow this for anonymous users)
      const { data: userData, error: userError } = await supabase
        .from('public_users')
        .select('*')
        .eq('email', values.email)
        .eq('status', 'approved')
        .single()

      if (userError || !userData) {
        throw new Error("Account not found or not approved yet. Please wait for admin approval.")
      }

      // Verify password using bcrypt
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(values.password, userData.password_hash || "")
      
      if (!isPasswordValid) {
        throw new Error("Invalid email or password.")
      }

      // User verified - create or login to Supabase Auth
      // First try to login
      console.log("Attempting Supabase Auth login...", values.email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError) {
        console.error("Auth error:", authError);
        console.log("Auth error message:", authError.message);
        console.log("Auth error status:", authError.status);
        
        // If user doesn't exist in auth yet (Invalid login credentials or 400), create auth account
        if (authError.message?.includes("Invalid login credentials") || 
            authError.message?.includes("400") ||
            authError.status === 400) {
          console.log("User not found in auth, attempting signup...");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              data: {
                full_name: userData.full_name,
                phone: userData.phone,
              }
            }
          })

          if (signUpError) {
            console.error("Signup error:", signUpError);
            throw new Error(signUpError.message || "Login failed. Please try again.")
          }

          console.log("Signup successful, attempting login...");
          // After signup, login automatically
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })

          if (loginError) {
            console.error("Login after signup error:", loginError);
            throw new Error("Login failed after account creation.")
          }
        } else {
          throw new Error(authError.message || "Login failed. Please try again.")
        }
      }

      router.push("/member")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Left Panel - Hero Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative flex-col justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80")' }}></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 relative mb-10 animate-in zoom-in duration-700">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              sizes="80px"
            />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            {t.login.welcomeTitle}
          </h1>
          <p className="text-brand-100/70 text-xl leading-relaxed mb-10">
            {t.login.welcomeSubtitle}
          </p>

          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
            {stats.length > 0 ? (
              stats.slice(0, 2).map((stat) => (
                <div key={stat.id}>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-brand-300 text-sm font-medium uppercase tracking-wider">
                    {locale === 'en' ? stat.labelEn : stat.labelNe}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <div className="text-3xl font-bold text-white">3,247+</div>
                  <div className="text-brand-300 text-sm font-medium uppercase tracking-wider">{t.stats.members}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">NPR 12Cr</div>
                  <div className="text-brand-300 text-sm font-medium uppercase tracking-wider">{t.stats.capital}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-24 justify-center bg-slate-50">
        <div className="max-w-[420px] w-full mx-auto space-y-10">
          
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t.login.backHome}
            </Link>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t.login.title}</h2>
            <p className="text-slate-500 font-medium">{t.login.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="example@gmail.com" 
                    className="h-14 pl-12 border-slate-200 bg-white focus:bg-white focus:ring-brand-500 rounded-2xl shadow-sm transition-all" 
                    {...register("email")} 
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" title="Password" className="text-slate-700 font-bold">{t.register.password}</Label>
                  <Link href="#" className="text-xs font-bold text-brand-700 hover:underline">{t.login.forgot}</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="h-14 pl-12 pr-12 border-slate-200 bg-white focus:bg-white focus:ring-brand-500 rounded-2xl shadow-sm transition-all" 
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
                {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-semibold animate-in shake-2 duration-300">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-2xl shadow-lg shadow-brand-700/20 transition-all active:scale-[0.98]">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : t.login.signIn}
            </Button>
          </form>

          <div className="text-center pt-6 border-t border-slate-200">
            <p className="text-slate-500 font-medium">
              {t.login.noAccount}{" "}
              <Link href="/register" className="text-brand-700 font-extrabold hover:underline">
                {t.login.register}
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
