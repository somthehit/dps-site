"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactClient({ settings = {} }: { settings?: Record<string, string> }) {
  const { t, locale } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const phone = settings.phone ?? "+977-9805791785";
  const email = settings.email ?? "dps.cop724@gmail.com";
  const address = (locale === "ne" ? settings.address_ne : settings.address_en) || t.nav.address;
  const officeHours = settings.office_hours ?? "Sun - Fri: 10:00 AM - 5:00 PM";
  const mapsUrl = settings.google_maps_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease] min-h-screen bg-slate-50">
      <div className="bg-brand-900 px-10 pt-20 pb-[60px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,1) 0, rgba(255,255,255,1) 1px, transparent 0, transparent 60px)' }}></div>
        <div className="container mx-auto">
          <div className="text-[11px] font-semibold text-brand-300 tracking-[2px] uppercase mb-4 relative">{t.contactPage.title}</div>
          <h1 className="font-sans text-[42px] md:text-[54px] font-bold text-white leading-[1.1] tracking-[-0.8px] relative max-w-[700px] mb-6">
            {t.contactPage.header}
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl relative">
            {t.contactPage.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          
          {/* Contact Form */}
          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-xl shadow-brand-900/5">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-[fadeUp_0.4s_ease]">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.contactPage.success.split('!')[0]}!</h3>
                <p className="text-slate-500 max-w-md">{t.contactPage.success.split('!')[1]}</p>
                <button onClick={() => setSubmitted(false)} className="mt-8 text-brand-700 font-bold hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider ml-1">{t.contactPage.name}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all" 
                      placeholder="Name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider ml-1">{t.contactPage.email}</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all" 
                      placeholder="Email Address" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider ml-1">{t.contactPage.phone}</label>
                      <input 
                        required 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all" 
                        placeholder="Phone Number" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider ml-1">{t.contactPage.subject}</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all" 
                        placeholder="How can we help?" 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider ml-1">{t.contactPage.message}</label>
                  <textarea 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full h-40 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 ring-brand-500/10 outline-none transition-all resize-none" 
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-brand-900 text-white font-bold rounded-2xl hover:bg-brand-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-900/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : <>{t.contactPage.send} <Send className="w-5 h-5" /></>}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8">{t.contactPage.info}</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.contactPage.address}</div>
                    <div className="text-slate-700 font-medium leading-relaxed">
                      {address}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.contactPage.phone}</div>
                    <div className="text-slate-700 font-medium">{phone}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.contactPage.emailLabel}</div>
                    <div className="text-slate-700 font-medium">{email}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.contactPage.officeHours}</div>
                    <div className="text-slate-700 font-medium">{officeHours}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h4 className="text-xl font-bold mb-4">Emergency Support?</h4>
              <p className="text-brand-200 text-sm mb-6 leading-relaxed">
                For urgent loan inquiries or banking issues, please call our hotline directly.
              </p>
              <a href={`tel:${phone}`} className="inline-flex items-center gap-2 font-bold text-brand-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="w-full h-[500px] bg-slate-200 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative group">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d415.5537861542905!2d80.74259925005468!3d28.764854340817983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDQ1JzUzLjYiTiA4MMKwNDQnMzMuMyJF!5e1!3m2!1sen!2snp!4v1777373911982!5m2!1sen!2snp"
            className="grayscale contrast-125 opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
          ></iframe>
          
          <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-80 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 pointer-events-none transition-transform group-hover:scale-105">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="font-black text-slate-900 uppercase tracking-wider text-xs">Our Location</div>
            </div>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
              {address}
            </p>
            {mapsUrl && (
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-700 hover:text-brand-900 pointer-events-auto"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
