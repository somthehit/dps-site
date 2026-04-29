
interface MemberPrintViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  member: Record<string, any>; // Relaxed type for props since it comes from DB
}

export default function MemberPrintView({ member }: MemberPrintViewProps) {
  return (
    <div className="hidden print:block w-full bg-white text-black p-8 font-serif">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4 relative">
        <h1 className="text-2xl font-bold uppercase tracking-widest">Dipshikha Krisi Sahakari Sanstha Ltd.</h1>
        <p className="text-sm mt-1">Gauriganga Nagarpalika - 01, Kailali</p>
        <h2 className="text-xl font-bold mt-4 underline underline-offset-4">MEMBERSHIP APPLICATION FORM</h2>

        {/* Photo Box */}
        <div className="absolute top-0 right-0 w-32 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 overflow-hidden">
          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.photoUrl} alt="Photo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">PP Size Photo</span>
          )}
        </div>
      </div>

      <div className="space-y-6 text-sm">
        {/* 1. Personal Details */}
        <section>
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-2">1. Personal Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Full Name (English):</td>
                <td className="border border-gray-300 p-2 w-1/4 uppercase">{member.firstName} {member.middleName} {member.lastName}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Full Name (Nepali):</td>
                <td className="border border-gray-300 p-2 w-1/4 font-sans">{member.firstNameNepali} {member.lastNameNepali}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Gender:</td>
                <td className="border border-gray-300 p-2">{member.gender}</td>
                <td className="border border-gray-300 p-2 font-semibold">Date of Birth:</td>
                <td className="border border-gray-300 p-2">{member.dateOfBirth}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 2. Contact & Address */}
        <section>
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-2">2. Contact & Address Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Mobile Number:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.mobileNo}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Email Address:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.email || "N/A"}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50" colSpan={4}>Permanent Address</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Province & District:</td>
                <td className="border border-gray-300 p-2 font-sans">{member.province}, {member.district}</td>
                <td className="border border-gray-300 p-2 font-semibold">Municipality & Ward:</td>
                <td className="border border-gray-300 p-2 font-sans">{member.municipality}, Ward-{member.wardNo}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Tole/Village:</td>
                <td className="border border-gray-300 p-2 font-sans" colSpan={3}>{member.tole}</td>
              </tr>

              <tr>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50" colSpan={4}>Temporary Address</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Province & District:</td>
                <td className="border border-gray-300 p-2 font-sans">{member.tempProvince}, {member.tempDistrict}</td>
                <td className="border border-gray-300 p-2 font-semibold">Municipality & Ward:</td>
                <td className="border border-gray-300 p-2 font-sans">{member.tempMunicipality}, Ward-{member.tempWardNo}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Tole/Village:</td>
                <td className="border border-gray-300 p-2 font-sans" colSpan={3}>{member.tempTole}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 3. Family & Professional Details */}
        <section>
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-2">3. Family & Professional Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Father&apos;s Name:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.fatherName}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Grandfather&apos;s Name:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.grandfatherName}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Spouse&apos;s Name:</td>
                <td className="border border-gray-300 p-2">{member.spouseName || "N/A"}</td>
                <td className="border border-gray-300 p-2 font-semibold">Primary Occupation:</td>
                <td className="border border-gray-300 p-2">{member.occupation}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 4. KYC & Citizenship */}
        <section>
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-2">4. KYC & Identity Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Citizenship No.:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.citizenshipNo}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Issue Date:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.citizenshipIssueDate}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Issue District:</td>
                <td className="border border-gray-300 p-2" colSpan={3}>{member.citizenshipIssueDistrict}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. Nominee Details */}
        <section>
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-2">5. Nominee Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Nominee Name:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.nomineeName}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Relation:</td>
                <td className="border border-gray-300 p-2 w-1/4">{member.nomineeRelation}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Contact No.:</td>
                <td className="border border-gray-300 p-2" colSpan={3}>{member.nomineeContact}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Declaration and Signature */}
        <section className="mt-8">
          <p className="text-justify mb-8">
            I hereby declare that all the information provided above is true and correct to the best of my knowledge. I agree to abide by the rules and regulations of Dipshikha Krishi Sahakari Sanstha Ltd.
          </p>
          <div className="flex justify-between items-end px-12">
            <div className="text-center">
              <div className="w-32 h-16 border-b border-black mb-2 flex items-end justify-center relative">
                {member.signatureUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <p className="font-semibold">Applicant&apos;s Signature</p>
              <p>Date: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "__________________"}</p>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-24 h-28 border-2 border-black flex items-center justify-center mb-1">
                  <span className="text-gray-400 text-xs">Right Thumb</span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-24 h-28 border-2 border-black flex items-center justify-center mb-1">
                  <span className="text-gray-400 text-xs">Left Thumb</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Citizenship Photos */}
        <section className="mt-8">
          <h3 className="font-bold text-lg bg-gray-100 px-2 py-1 mb-4">6. Citizenship Certificate</h3>
          <div className="flex gap-4">
            <div className="flex-1 border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden h-48">
              {member.citizenshipFrontUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.citizenshipFrontUrl} alt="Citizenship Front" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="text-gray-400">Front Side</div>
              )}
            </div>
            <div className="flex-1 border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden h-48">
              {member.citizenshipBackUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.citizenshipBackUrl} alt="Citizenship Back" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="text-gray-400">Back Side</div>
              )}
            </div>
          </div>
        </section>

        {/* Official Use Only */}
        <section className="mt-12 border-t-2 border-dashed border-black pt-6">
          <h3 className="font-bold text-lg uppercase text-center mb-6">For Official Use Only</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Status:</td>
                <td className="border border-gray-300 p-2 w-1/4 font-bold uppercase">{member.status}</td>
                <td className="border border-gray-300 p-2 font-semibold w-1/4">Member Code:</td>
                <td className="border border-gray-300 p-2 w-1/4 font-bold">{member.memberCode || "__________________"}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold">Approval Date:</td>
                <td className="border border-gray-300 p-2">{member.approvalDate ? new Date(member.approvalDate).toLocaleDateString() : "__________________"}</td>
                <td className="border border-gray-300 p-2 font-semibold">Approved By:</td>
                <td className="border border-gray-300 p-2">__________________</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-semibold" colSpan={2}>
                  <div className="h-20"></div>
                  <p className="text-center border-t border-black w-3/4 mx-auto pt-1">Manager/Officer Signature</p>
                </td>
                <td className="border border-gray-300 p-2 font-semibold" colSpan={2}>
                  <div className="h-20"></div>
                  <p className="text-center border-t border-black w-3/4 mx-auto pt-1">Official Stamp</p>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}
