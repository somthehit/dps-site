"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface WhatsAppChatProps {
  phoneNumber?: string;
  settings?: Record<string, string>;
}

export default function WhatsAppChat({ phoneNumber, settings = {} }: WhatsAppChatProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const whatsappNumber = phoneNumber || settings.whatsapp || settings.phone || "9805791785";
  // Remove any non-digit characters and ensure it starts with 977 if it's a local number
  const formattedNumber = whatsappNumber.replace(/\D/g, "");
  const finalNumber = formattedNumber.startsWith("977") ? formattedNumber : `977${formattedNumber}`;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${finalNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setMessage("");
    setIsOpen(false);
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[360px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-brand-600 p-6 text-white relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center relative">
                <MessageCircle className="w-6 h-6" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-brand-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.whatsapp.title}</h3>
                <p className="text-brand-100 text-xs">{t.whatsapp.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-slate-50">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%]">
              <p className="text-sm text-slate-700 leading-relaxed">
                {t.whatsapp.welcome}
              </p>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder={t.whatsapp.inputPlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
            <Button 
              type="submit"
              size="icon"
              className="bg-brand-600 hover:bg-brand-700 rounded-xl w-11 h-11 shrink-0 shadow-lg shadow-brand-600/20 active:scale-90 transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 group relative",
          isOpen ? "bg-slate-800 rotate-90" : "bg-emerald-500 hover:bg-emerald-600"
        )}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <>
            <MessageCircle className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce">
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
}
