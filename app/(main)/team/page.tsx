import { Metadata } from "next";
import TeamClient from "@/components/pages/TeamClient";

export const metadata: Metadata = {
  title: "Our Team",
};

export default function TeamPage() {
  return <TeamClient />;
}
