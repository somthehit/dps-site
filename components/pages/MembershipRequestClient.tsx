"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User, MapPin, Users,
  FileCheck, ChevronRight, ChevronLeft,
  Upload, Check, Loader2, Info, Home
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type GeoData = {
  [province: string]: {
    [district: string]: {
      [municipality: string]: string[];
    };
  };
};

// Validation Schema based on the database fields
const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().default(""),
  lastName: z.string().min(1, "Last name is required"),
  firstNameNepali: z.string().min(1, "Nepali first name is required"),
  lastNameNepali: z.string().min(1, "Nepali last name is required"),
  gender: z.string().default(""),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  citizenshipNo: z.string().min(1, "Citizenship number is required"),
  citizenshipIssueDistrict: z.string().default(""),
  citizenshipIssueDate: z.string().min(1, "Citizenship issue date is required"),
  mobileNo: z.string().min(10, "Valid mobile number is required"),
  altMobileNo: z.string().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  province: z.string().default(""),
  district: z.string().default(""),
  municipality: z.string().default(""),
  wardNo: z.coerce.number().default(0),
  tole: z.string().default(""),
  tempProvince: z.string().default(""),
  tempDistrict: z.string().default(""),
  tempMunicipality: z.string().default(""),
  tempWardNo: z.coerce.number().default(0),
  tempTole: z.string().default(""),
  fatherName: z.string().default(""),
  grandfatherName: z.string().default(""),
  spouseName: z.string().default(""),
  occupation: z.string().default(""),
  monthlyIncome: z.string().default(""),
  memberType: z.string().default("Individual"),
  nomineeName: z.string().default(""),
  nomineeRelation: z.string().default(""),
  nomineeContact: z.string().default(""),
});

type MemberFormData = z.infer<typeof memberSchema>;

const STEPS = [
  { id: 1, title: "Identity", icon: User },
  { id: 2, title: "Contact", icon: MapPin },
  { id: 3, title: "Family", icon: Users },
  { id: 4, title: "KYC & Docs", icon: FileCheck },
];

export default function MembershipRequestClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<{ [key: string]: string }>({});
  const { locale } = useLanguage();
  const [geoData, setGeoData] = useState<GeoData | null>(null);

  // Address Sync State
  const [sameAsDocument, setSameAsDocument] = useState(true);
  const [sameAsPermanent, setSameAsPermanent] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      firstNameNepali: "",
      lastNameNepali: "",
      gender: "",
      dateOfBirth: "",
      citizenshipNo: "",
      citizenshipIssueDistrict: "",
      citizenshipIssueDate: "",
      mobileNo: "",
      altMobileNo: "",
      email: "",
      province: "",
      district: "",
      municipality: "",
      wardNo: 0,
      tole: "",
      tempProvince: "",
      tempDistrict: "",
      tempMunicipality: "",
      tempWardNo: 0,
      tempTole: "",
      fatherName: "",
      grandfatherName: "",
      spouseName: "",
      occupation: "",
      monthlyIncome: "",
      memberType: "Individual",
      nomineeName: "",
      nomineeRelation: "",
      nomineeContact: "",
    }
  });

  // Load Geo Location Data
  useEffect(() => {
    const fileName = locale === "ne" ? "/geo_location_np.json" : "/geo_location_en.json";
    fetch(fileName)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load geo data:", err));
  }, [locale]);

  // Address Watchers using useWatch for better performance
  const pProvince = useWatch({ control, name: "province" });
  const pDistrict = useWatch({ control, name: "district" });
  const pMunicipality = useWatch({ control, name: "municipality" });
  const pWardNo = useWatch({ control, name: "wardNo" });
  const pTole = useWatch({ control, name: "tole" });

  // Options for Permanent Address
  const pDistricts = useMemo(() => geoData && pProvince ? Object.keys(geoData[pProvince] || {}) : [], [geoData, pProvince]);
  const pMunicipalities = useMemo(() => geoData && pProvince && pDistrict ? Object.keys(geoData[pProvince][pDistrict] || {}) : [], [geoData, pProvince, pDistrict]);
  const pWards = useMemo(() => geoData && pProvince && pDistrict && pMunicipality ? geoData[pProvince][pDistrict][pMunicipality] || [] : [], [geoData, pProvince, pDistrict, pMunicipality]);

  // Reset logic for Permanent Address
  useEffect(() => { setValue("district", ""); setValue("municipality", ""); setValue("wardNo", 0); }, [pProvince, setValue]);
  useEffect(() => { setValue("municipality", ""); setValue("wardNo", 0); }, [pDistrict, setValue]);
  useEffect(() => { setValue("wardNo", 0); }, [pMunicipality, setValue]);

  // Sync Logic
  useEffect(() => {
    if (sameAsPermanent || sameAsDocument) {
      setValue("tempProvince", pProvince || "");
      setValue("tempDistrict", pDistrict || "");
      setValue("tempMunicipality", pMunicipality || "");
      setValue("tempWardNo", Number(pWardNo) || 0);
      setValue("tempTole", pTole || "");
    }
  }, [sameAsPermanent, sameAsDocument, pProvince, pDistrict, pMunicipality, pWardNo, pTole, setValue]);

  // Handle Checkbox Changes
  const handleSameAsPermanentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) setSameAsDocument(false);
    if (!checked && !sameAsDocument) {
      clearTempAddress();
    }
  };

  const handleAsDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsDocument(checked);
    if (checked) setSameAsPermanent(false);
    if (!checked && !sameAsPermanent) {
      clearTempAddress();
    }
  };

  const clearTempAddress = () => {
    setValue("tempProvince", "");
    setValue("tempDistrict", "");
    setValue("tempMunicipality", "");
    setValue("tempWardNo", 0);
    setValue("tempTole", "");
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotos(prev => ({ ...prev, [fieldName]: data.url }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const onSubmit: SubmitHandler<MemberFormData> = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/members/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...photos // Include uploaded URLs
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden max-w-2xl mx-auto p-12 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Request Submitted!</h2>
        <p className="text-slate-600 mb-10 leading-relaxed">
          Your membership request has been received. Our administrative team will verify your documents and get back to you shortly. Thank you for choosing Dipshikha Krishi Sahakari Sanstha.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 px-8 h-12 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-8 h-12 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden mb-20">
      {/* Progress Header */}
      <div className="bg-slate-50 p-8 border-b border-slate-100">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-3 relative flex-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all z-10 ${step >= s.id ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "bg-white text-slate-400 border border-slate-200"
                }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? "text-brand-600" : "text-slate-400"
                }`}>{s.title}</span>

              {idx < STEPS.length - 1 && (
                <div className={`absolute top-6 -right-1/2 w-full h-[2px] ${step > s.id ? "bg-brand-600" : "bg-slate-200"
                  }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-10 max-w-4xl mx-auto">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">First Name (English) *</label>
                <input {...register("firstName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.firstName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.firstName.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Middle Name</label>
                <input {...register("middleName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Last Name *</label>
                <input {...register("lastName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.lastName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.lastName.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">नाम (नेपाली) *</label>
                <input {...register("firstNameNepali")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.firstNameNepali && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.firstNameNepali.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">थर (नेपाली) *</label>
                <input {...register("lastNameNepali")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.lastNameNepali && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.lastNameNepali.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                <select {...register("gender")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth (B.S.) *</label>
                <input type="text" placeholder="YYYY-MM-DD" {...register("dateOfBirth")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.dateOfBirth && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.dateOfBirth.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Member Type</label>
                <select {...register("memberType")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all">
                  <option value="Individual">Individual</option>
                  <option value="Institutional">Institutional</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Address */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mobile No *</label>
                <input {...register("mobileNo")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.mobileNo && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.mobileNo.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input {...register("email")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    Permanent Address
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select {...register("province")} className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold">
                    <option value="">Select Province</option>
                    {geoData && Object.keys(geoData).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select {...register("district")} className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold">
                    <option value="">Select District</option>
                    {pDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select {...register("municipality")} className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold">
                    <option value="">Select Municipality</option>
                    {pMunicipalities.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select {...register("wardNo")} className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold">
                    <option value="">Select Ward</option>
                    {pWards.map((w: string) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <input {...register("tole")} placeholder="Tole/Village" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold col-span-2" />
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    Temporary Address
                  </h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-brand-600 transition-colors">
                      <input type="checkbox" checked={sameAsDocument} onChange={handleAsDocumentChange} className="w-3 h-3 accent-brand-600" />
                      As per Document
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-brand-600 transition-colors">
                      <input type="checkbox" checked={sameAsPermanent} onChange={handleSameAsPermanentChange} className="w-3 h-3 accent-brand-600" />
                      Same as Permanent
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input {...register("tempProvince")} placeholder="Province" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                  <input {...register("tempDistrict")} placeholder="District" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                  <input {...register("tempMunicipality")} placeholder="Municipality" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                  <input {...register("tempWardNo")} placeholder="Ward No" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                  <input {...register("tempTole")} placeholder="Tole/Village" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold col-span-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Family & Work */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Father&apos;s Full Name</label>
                <input {...register("fatherName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Grandfather&apos;s Name</label>
                <input {...register("grandfatherName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Spouse Name (if applicable)</label>
                <input {...register("spouseName")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Income</label>
                <input {...register("monthlyIncome")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                Nominee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input {...register("nomineeName")} placeholder="Nominee Name" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                <input {...register("nomineeRelation")} placeholder="Relation" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
                <input {...register("nomineeContact")} placeholder="Nominee Phone" className="h-12 px-4 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: KYC & Docs */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Citizenship No *</label>
                <input {...register("citizenshipNo")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.citizenshipNo && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.citizenshipNo.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Issue District</label>
                <input {...register("citizenshipIssueDistrict")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Issue Date (B.S.) *</label>
                <input type="text" placeholder="YYYY-MM-DD" {...register("citizenshipIssueDate")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-brand-500/5 outline-none transition-all" />
                {errors.citizenshipIssueDate && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.citizenshipIssueDate.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Profile Photo", field: "photoUrl" },
                { label: "Citizenship Front", field: "citizenshipFrontUrl" },
                { label: "Citizenship Back", field: "citizenshipBackUrl" },
                { label: "Member Signature", field: "signatureUrl" },
              ].map(doc => (
                <div key={doc.field} className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{doc.label}</div>
                  <div className="relative group aspect-square rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-brand-500/50 transition-all cursor-pointer">
                    {photos[doc.field] ? (
                      <>
                        <Image src={photos[doc.field]} alt={doc.label} fill className="object-cover" />
                        <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand-500 transition-colors" />
                        <span className="text-[10px] font-bold text-slate-400">Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, doc.field)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-blue-50 rounded-[32px] flex gap-4">
              <Info className="w-6 h-6 text-blue-500 shrink-0" />
              <div className="text-sm text-blue-800 leading-relaxed">
                <strong className="block mb-1 text-base">Final Verification</strong>
                Please ensure all information matches the provided citizenship documents. Inaccurate data may delay membership approval and future loan processes.
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-12 pt-10 border-t border-slate-100">
          {step > 1 ? (
            <button type="button" onClick={prev} className="flex items-center gap-2 px-6 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : <div />}

          {step < STEPS.length ? (
            <button type="button" onClick={next} className="flex items-center gap-2 px-8 h-12 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10">
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button disabled={loading} type="submit" className="flex items-center gap-2 px-10 h-12 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Submit Membership Request
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
