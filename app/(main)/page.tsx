import { Metadata } from "next";
import HomeClient from "@/components/pages/HomeClient";

export const metadata: Metadata = {
  title: "Dipshikha Krishi Sahakari | Empowering Farmers",
  description: "Dipshikha Krishi Sahakari Sanstha Ltd. is dedicated to supporting farmers in Kavrepalanchok with financial services and agricultural expertise.",
};

export default function Home() {
  return <HomeClient />;
}
