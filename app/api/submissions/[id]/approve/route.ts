import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, approvalLogs, forms } from "@/db/forms-schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/forms/notifications";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string }> };

// POST /api/submissions/[id]/approve
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { adminId, stepId, remarks, memberEmail, memberId } = await request.json();

    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextStep = (submission.currentStep ?? 0) + 1;
    // TODO: check if there are more steps; if not, mark completed
    const newStatus = "approved";

    await db.update(formSubmissions).set({
      status: newStatus,
      currentStep: nextStep,
    }).where(eq(formSubmissions.id, id));

    await db.insert(approvalLogs).values({
      submissionId: id,
      stepId: stepId ?? null,
      action: "approved",
      remarks: remarks ?? null,
      approvedBy: adminId ?? null,
    });

    const [form] = await db.select({ name: forms.name }).from(forms).where(eq(forms.id, submission.formId));

    if (memberId) {
      await createNotification({
        userId: memberId, userType: "member",
        type: "submission_approved",
        title: "तपाईंको फाराम स्वीकृत भयो / Your submission is approved",
        message: `Submission ${submission.submissionCode} has been approved.`,
        payload: { submissionId: id, submissionCode: submission.submissionCode },
        link: `/member/submissions/${id}`,
        email: memberEmail,
      });
    }

    await writeAuditLog({
      actorId: adminId, actorType: "admin",
      entityType: "submission", entityId: id, action: "submission_approved",
      before: { status: submission.status }, after: { status: newStatus, remarks },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
