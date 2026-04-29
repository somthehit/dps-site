"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, ArrowRight, UploadCloud, CheckCircle2, Lock, Loader2, FileCheck } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useTranslation } from "@/lib/i18n/useTranslation"
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  citizenshipNo: z.string().min(5, "Citizenship number is required"),
})

export default function RegisterClient() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [citizenshipUrls, setCitizenshipUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const newUrls: string[] = [...citizenshipUrls]
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `citizenship/${Date.now()}_${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('member-docs')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('member-docs')
          .getPublicUrl(filePath)
        
        newUrls.push(publicUrl)
      }

      setCitizenshipUrls(newUrls)
    } catch (err: any) {
      setError("Failed to upload image. Please try again.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(["fullName", "phone", "address"])
    } else if (step === 2) {
      isValid = await trigger(["citizenshipNo"])
    }

    if (isValid) setStep(s => s + 1)
  }

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signUp({
        phone: values.phone,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            address: values.address,
            citizenship_no: values.citizenshipNo,
            citizenship_urls: citizenshipUrls,
          },
        },
      })

      if (authError) throw authError
      setStep(4)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/3 bg-brand-900 relative flex-col justify-between p-12 overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1592982537447-6f296d9f3ac1?auto=format&fit=crop&q=80")' }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-brand-200 hover:text-white transition-colors w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t.register.back}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="w-14 h-14 relative mb-6">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              sizes="80px"
            />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            {t.register.title}
          </h1>
          <p className="text-brand-100/70 text-lg leading-relaxed">
            {t.register.subtitle}
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-brand-800 border-2 border-brand-900 flex items-center justify-center text-xs">
                  🧑‍🌾
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white">Join 15 new members this week</div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 w-3/4 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-2/3 flex flex-col p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-[500px] w-full mx-auto flex-1 flex flex-col justify-center py-10">

          {step < 4 && (
            <div className="mb-12">
              <div className="flex items-center justify-between relative">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 rounded-full -z-10 transition-all duration-500"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>

                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30" :
                        i === step ? "bg-brand-900 text-white ring-4 ring-brand-100" :
                          "bg-white text-slate-400 border-2 border-slate-200"
                      }`}
                  >
                    {i < step ? <CheckCircle2 className="w-5 h-5" /> : i}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.register.personal}</h2>
                  <p className="text-slate-500">{t.register.subtitle}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 font-semibold">{t.register.fullName}</Label>
                    <Input id="fullName" placeholder="Som Prakash Chaudhary" className="h-12 border-slate-200 focus:ring-brand-500 rounded-xl" {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-semibold">{t.register.phone}</Label>
                      <Input id="phone" placeholder="98XXXXXXXX" className="h-12 border-slate-200 focus:ring-brand-500 rounded-xl" {...register("phone")} />
                      {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-slate-700 font-semibold">{t.register.address}</Label>
                      <Input id="address" placeholder="Gauriganga-1, Chaumala" className="h-12 border-slate-200 focus:ring-brand-500 rounded-xl" {...register("address")} />
                      {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={nextStep} className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-xl shadow-lg shadow-brand-700/20">
                  {t.register.next} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t.register.back}
                </button>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.register.idVerification}</h2>
                  <p className="text-slate-500">{t.register.idDesc}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizenshipNo" className="text-slate-700 font-semibold">{t.register.citizenship}</Label>
                    <Input id="citizenshipNo" placeholder="XX-XX-XX-XXXXX" className="h-12 border-slate-200 focus:ring-brand-500 rounded-xl" {...register("citizenshipNo")} />
                    {errors.citizenshipNo && <p className="text-xs text-red-500 font-medium">{errors.citizenshipNo.message}</p>}
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 border-2 border-dashed rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-brand-300 hover:bg-brand-50/30"
                    } ${citizenshipUrls.length > 0 ? "border-brand-200" : "border-slate-200"}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">
                      {isUploading ? "Uploading..." : t.register.uploadId}
                    </div>
                    <p className="text-xs text-slate-500">{t.register.dragDrop}</p>
                  </div>

                  {citizenshipUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {citizenshipUrls.map((url, i) => (
                        <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200">
                          <Image src={url} alt={`Citizenship ${i + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && step === 2 && (
                    <p className="text-xs text-red-500 font-medium text-center">{error}</p>
                  )}
                </div>

                <Button type="button" onClick={nextStep} className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-xl shadow-lg">
                  {t.register.next} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t.register.back}
                </button>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.register.secureAccount}</h2>
                  <p className="text-slate-500">{t.register.secureDesc}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" title="Password" className="text-slate-700 font-semibold">{t.register.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input id="password" type="password" placeholder="••••••••" className="h-14 pl-12 border-slate-200 focus:ring-brand-500 rounded-xl" {...register("password")} />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-in shake-2 duration-300">
                      {error}
                    </div>
                  )}

                  <div className="bg-brand-50 p-4 rounded-xl flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-600" />
                    </div>
                    <p className="text-xs text-brand-800 leading-relaxed">
                      {t.register.agree}
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-xl shadow-lg">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : t.register.submit}
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">{t.register.success}</h2>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    {t.register.received}
                  </p>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full h-14 bg-brand-700 hover:bg-brand-800 text-lg font-bold rounded-xl shadow-lg">
                    {t.register.dashboard}
                  </Button>
                </Link>
              </div>
            )}
          </form>

          {step < 4 && (
            <p className="text-center mt-12 text-slate-500">
              {t.register.alreadyMember}{" "}
              <Link href="/login" className="text-brand-700 font-bold hover:underline">
                {t.register.loginHere}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
