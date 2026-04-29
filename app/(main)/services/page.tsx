import { Metadata } from "next";
import ServicesClient from "@/components/pages/ServicesClient";

export const metadata: Metadata = {
  title: "Our Services | Dipshikha Sahakari",
  description: "Explore our comprehensive agricultural and financial services, including savings, loans, and technical support for farmers.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
