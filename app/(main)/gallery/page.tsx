import { Metadata } from "next";
import GalleryClient from "@/components/pages/GalleryClient";

export const metadata: Metadata = {
  title: "Photo Gallery | Dipshikha Sahakari",
  description: "View moments from our community, field visits, trainings, and annual general meetings.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
