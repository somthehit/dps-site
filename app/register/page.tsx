import { Metadata } from "next";
import RegisterClient from "@/components/pages/RegisterClient";

export const metadata: Metadata = {
  title: "Member Registration | Dipshikha Sahakari",
  description: "Join Dipshikha Krishi Sahakari today. Apply for membership to access agricultural loans, savings programs, and community support.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
