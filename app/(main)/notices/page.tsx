import { Metadata } from "next";
import NoticesClient from "@/components/pages/NoticesClient";

export const metadata: Metadata = {
  title: "Notices & Updates",
  description: "Read the latest official notices, meeting announcements, and community updates from Dipshikha Krishi Sahakari Sanstha Ltd.",
};

export default function NoticesPage() {
  return <NoticesClient />;
}
