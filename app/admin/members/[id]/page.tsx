import AuthenticatedLayout from "@/components/admin/AuthenticatedLayout";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  User, MapPin, Phone,
  ArrowLeft, Edit3, ShieldCheck, Users, Heart, Briefcase,
  FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MemberActionButtons from "@/components/admin/MemberActionButtons";
import MemberPrintButtons from "@/components/admin/MemberPrintButtons";
import MemberPrintView from "@/components/admin/MemberPrintView";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value || "—"}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children }: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;

  const member = await db.query.members.findFirst({
    where: eq(members.id, id),
  });

  if (!member) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    inactive: "bg-slate-100 text-slate-600",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <AuthenticatedLayout>
      {/* Normal Web View */}
      <div className="space-y-8 pb-20 print:hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/members"
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Member Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded">
                  {member.memberCode || "PENDING"}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[member.status ?? "pending"] ?? "bg-slate-100 text-slate-600"}`}>
                  {member.status}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {member.memberType}
                </span>
              </div>
            </div>
          </div>

          <MemberPrintButtons />
          <MemberActionButtons memberId={id} currentStatus={member.status} />
          <Link
            href={`/admin/members/${id}/edit`}
            className="flex items-center justify-center gap-2 px-6 h-12 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
          >
            <Edit3 className="w-5 h-5" />
            Edit Member
          </Link>
        </div>

        {/* Profile Card + Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl mb-4">
              {member.photoUrl ? (
                <Image src={member.photoUrl} alt={member.firstName} fill sizes="112px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User className="w-14 h-14" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {member.firstName} {member.middleName ? member.middleName + " " : ""}{member.lastName}
            </h2>
            {(member.firstNameNepali || member.lastNameNepali) && (
              <p className="text-base font-bold text-slate-500 mt-0.5">
                {member.firstNameNepali} {member.lastNameNepali}
              </p>
            )}
            <p className="text-brand-600 font-bold text-xs mt-2 uppercase tracking-widest">{member.memberType} Member</p>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
              <Phone className="w-6 h-6 text-blue-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <InfoRow label="Mobile Number" value={member.mobileNo} />
              <InfoRow label="Alternate Mobile" value={member.altMobileNo} />
              <InfoRow label="Email Address" value={member.email} />
              <InfoRow label="Gender" value={member.gender} />
              <InfoRow label="Date of Birth" value={member.dateOfBirth} />
              <InfoRow label="Join Date" value={member.joinDate} />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-brand-600" />
            Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Permanent */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-brand-600"></div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Permanent Address</p>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoRow label="Province" value={member.province} />
                <InfoRow label="District" value={member.district} />
                <InfoRow label="Municipality" value={member.municipality} />
                <InfoRow label="Ward No." value={member.wardNo} />
                <div className="col-span-2">
                  <InfoRow label="Tole / Village" value={member.tole} />
                </div>
              </div>
            </div>
            {/* Temporary */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Temporary Address</p>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoRow label="Province" value={member.tempProvince} />
                <InfoRow label="District" value={member.tempDistrict} />
                <InfoRow label="Municipality" value={member.tempMunicipality} />
                <InfoRow label="Ward No." value={member.tempWardNo} />
                <div className="col-span-2">
                  <InfoRow label="Tole / Village" value={member.tempTole} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Citizenship / KYC */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            KYC & Identity Verification
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <InfoRow label="Citizenship No." value={member.citizenshipNo} />
            <InfoRow label="Issue District" value={member.citizenshipIssueDistrict} />
            <InfoRow label="Issue Date" value={member.citizenshipIssueDate} />
            <InfoRow label="Member Code" value={member.memberCode} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Profile Photo", url: member.photoUrl },
              { label: "Citizenship Front", url: member.citizenshipFrontUrl },
              { label: "Citizenship Back", url: member.citizenshipBackUrl },
              { label: "Signature", url: member.signatureUrl },
            ].map((doc) => (
              <div key={doc.label} className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{doc.label}</p>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  {doc.url ? (
                    <Image src={doc.url} alt={doc.label} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      Not Uploaded
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Family, Nominee, Occupation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard title="Family Details" icon={Users} iconColor="text-violet-600">
            <div className="space-y-5">
              <InfoRow label="Father's Name" value={member.fatherName} />
              <InfoRow label="Grandfather's Name" value={member.grandfatherName} />
              <InfoRow label="Spouse Name" value={member.spouseName} />
            </div>
          </SectionCard>

          <SectionCard title="Nominee Information" icon={Heart} iconColor="text-red-500">
            <div className="space-y-5">
              <InfoRow label="Nominee Name" value={member.nomineeName} />
              <InfoRow label="Relation" value={member.nomineeRelation} />
              <InfoRow label="Contact Number" value={member.nomineeContact} />
            </div>
          </SectionCard>

          <SectionCard title="Professional Status" icon={Briefcase} iconColor="text-blue-600">
            <div className="space-y-5">
              <InfoRow label="Primary Occupation" value={member.occupation} />
              <InfoRow label="Monthly Income" value={member.monthlyIncome ? `Rs. ${member.monthlyIncome}` : null} />
            </div>
          </SectionCard>
        </div>

        {/* Approval / Meta */}
        <div className="bg-slate-50 rounded-[32px] border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Application Metadata
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoRow label="Status" value={member.status} />
                <InfoRow label="Approval Date" value={member.approvalDate ? new Date(member.approvalDate).toLocaleDateString() : null} />
                <InfoRow label="Created At" value={member.createdAt ? new Date(member.createdAt).toLocaleDateString() : null} />
                <InfoRow label="Rejection Reason" value={member.rejectionReason} />
              </div>
            </div>

            {/* Action Buttons */}
            {(member.status === "pending" || member.status === "active" || member.status === "rejected") && (
              <div className="flex flex-col items-end gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membership Action</p>
                <MemberActionButtons memberId={id} currentStatus={member.status} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paper Form Print View */}
      <MemberPrintView member={member} />
    </AuthenticatedLayout>
  );
}
