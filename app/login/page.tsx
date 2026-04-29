import { Metadata } from "next";
import LoginClient from "@/components/pages/LoginClient";
import { getSiteStats } from "@/lib/data/site-config";

export const metadata: Metadata = {
  title: "Member Login | Dipshikha Sahakari",
  description: "Login to your Dipshikha Krishi Sahakari member account to access your savings, loans, and updates.",
};

export default async function LoginPage() {
  const stats = await getSiteStats();
  return <LoginClient stats={stats} />;
}
