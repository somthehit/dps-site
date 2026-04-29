import { Metadata } from "next";
import TeamClient from "@/components/pages/TeamClient";

export const metadata: Metadata = {
  title: "Our Team | Dipshikha Sahakari",
};

export default function TeamPage() {
  return <TeamClient />;
}
