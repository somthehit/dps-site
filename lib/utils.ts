import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatExternalUrl(url: string) {
  if (!url) return "#";
  let cleanUrl = url.trim();
  if (cleanUrl === "#") return "#";
  
  // Remove leading # if it exists before a domain-like string
  if (cleanUrl.startsWith("#")) {
    cleanUrl = cleanUrl.substring(1);
  }

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("mailto:") || cleanUrl.startsWith("tel:")) {
    return cleanUrl;
  }
  return `https://${cleanUrl}`;
}

