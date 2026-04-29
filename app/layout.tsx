import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dpscoop.com.np"),
  title: {
    default: "Dipshikha Krishi Sahakari Sanstha Ltd.",
    template: "%s | Dipshikha Krishi Sahakari",
  },
  description: "A trusted agriculture cooperative serving farming families across Bagmati Province, providing savings, loans, and agricultural support.",
  keywords: ["agriculture cooperative", "Nepal", "farming", "microfinance", "savings and credit", "Bagmati Province", "Dipshikha Krishi Sahakari"],
  authors: [{ name: "Dipshikha Krishi Sahakari Sanstha Ltd." }],
  creator: "Dipshikha Krishi Sahakari Sanstha Ltd.",
  publisher: "Dipshikha Krishi Sahakari Sanstha Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dpscoop.com.np",
    siteName: "Dipshikha Krishi Sahakari Sanstha Ltd.",
    title: "Dipshikha Krishi Sahakari Sanstha Ltd.",
    description: "Empowering farmers through cooperative spirit in Bagmati Province, Nepal.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Dipshikha Krishi Sahakari Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dipshikha Krishi Sahakari Sanstha Ltd.",
    description: "Empowering farmers through cooperative spirit in Bagmati Province, Nepal.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${notoDevanagari.variable} ${notoSerifDevanagari.variable} font-sans bg-slate-50 text-slate-900`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
