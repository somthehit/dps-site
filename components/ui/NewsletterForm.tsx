"use client";

import { useState } from "react";
import { Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div className="bg-brand-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-800/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-700/50 transition-colors duration-700"></div>
      
      <div className="relative z-10 flex flex-col gap-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-800/50 flex items-center justify-center mb-2">
          <Megaphone className="w-6 h-6 text-brand-400" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-4">Join Newsletter</h2>
          <p className="text-brand-200 leading-relaxed max-w-sm">
            Stay updated with the latest news directly in your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
          <div className="relative">
            <input
              type="email"
              placeholder="somthehit@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading" || status === "success"}
              className="w-full bg-brand-800/40 border border-brand-700 rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-colors disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full bg-white text-brand-900 hover:bg-brand-50 h-14 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 disabled:bg-brand-200 disabled:text-brand-800"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === "success" ? (
              "Subscribed!"
            ) : (
              "Subscribe Now"
            )}
          </Button>

          {message && (
            <p className={`text-sm mt-2 font-medium ${status === "error" ? "text-red-400" : "text-brand-300"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
