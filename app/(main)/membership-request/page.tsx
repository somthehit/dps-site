import { Metadata } from "next";
import MembershipRequestClient from "../../../components/pages/MembershipRequestClient";

export const metadata: Metadata = {
  title: "Membership Request | Dipshikha Krishi Sahakari Sanstha",
  description: "Join Dipshikha Krishi Sahakari Sanstha by submitting a membership request. Fill out the KYC details and become a part of our cooperative.",
};

export default function MembershipRequestPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Join Our <span className="text-brand-600 underline decoration-brand-200 decoration-8 underline-offset-8">Cooperative</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Fill out the form below to request membership. Our administrative team will review your application and documents for approval.
          </p>
        </div>
        
        <MembershipRequestClient />
      </div>
    </main>
  );
}
