import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, approvalLogs } from "@/db/forms-schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/forms/notifications";

type Params = { params: Promise<{ id: string }> };

// POST /api/submissions/[id]/return — return for correction
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { adminId, stepId, remarks, memberEmail, memberId } = await request.json();

    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.update(formSubmissions).set({ status: "submitted", currentStep: 0 }).where(eq(formSubmissions.id, id));

    await db.insert(approvalLogs).values({
      submissionId: id, stepId: stepId ?? null,
      action: "returned", remarks: remarks ?? null, approvedBy: adminId ?? null,
    });

    if (memberId) {
      await createNotification({
        userId: memberId, userType: "member",
        type: "submission_returned",
        title: "फाराम सच्याउन फिर्ता / Returned for Correction",
        message: remarks ?? "Please review and resubmit your form.",
        payload: { submissionId: id, submissionCode: submission.submissionCode },
        link: `/member/submissions/${id}`,
        email: memberEmail,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
