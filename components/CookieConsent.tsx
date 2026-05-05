"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const grantConsent = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
    localStorage.setItem("cookieConsent", "granted");
    setShowBanner(false);
  };

  const denyConsent = () => {
    localStorage.setItem("cookieConsent", "denied");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          We use cookies to improve your experience. By continuing, you agree to our use of analytics cookies.
          <br />
          <span className="text-slate-400">हामी तपाईंको अनुभव सुधार गर्न कुकीहरू प्रयोग गर्छौं।</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={denyConsent}
            className="px-4 py-2 text-sm bg-transparent border border-slate-600 rounded hover:bg-slate-800 transition"
          >
            Decline / अस्वीकार
          </button>
          <button
            onClick={grantConsent}
            className="px-4 py-2 text-sm bg-emerald-600 rounded hover:bg-emerald-700 transition"
          >
            Accept / स्वीकार
          </button>
        </div>
      </div>
    </div>
  );
}
