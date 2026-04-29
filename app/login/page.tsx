import { Metadata } from "next";
import LoginClient from "@/components/pages/LoginClient";

export const metadata: Metadata = {
  title: "Member Login | Dipshikha Sahakari",
  description: "Login to your Dipshikha Krishi Sahakari member account to access your savings, loans, and updates.",
};

export default function LoginPage() {
  return <LoginClient />;
}
