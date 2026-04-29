import { Metadata } from "next";
import DownloadsClient from "@/components/pages/DownloadsClient";

export const metadata: Metadata = {
  title: "Downloads & Resources | Dipshikha Sahakari",
  description: "Download membership forms, loan applications, annual reports, and official cooperative bylaws.",
};

export default function DownloadsPage() {
  return <DownloadsClient />;
}
