import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, approvalLogs } from "@/db/forms-schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/forms/notifications";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { adminId, stepId, reason, memberEmail, memberId } = await request.json();

    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.update(formSubmissions).set({ status: "rejected" }).where(eq(formSubmissions.id, id));

    await db.insert(approvalLogs).values({
      submissionId: id, stepId: stepId ?? null,
      action: "rejected", remarks: reason ?? null, approvedBy: adminId ?? null,
    });

    if (memberId) {
      await createNotification({
        userId: memberId, userType: "member",
        type: "submission_rejected",
        title: "तपाईंको फाराम अस्वीकृत भयो / Submission Rejected",
        message: `Reason: ${reason ?? "See submission details"}`,
        payload: { submissionId: id, submissionCode: submission.submissionCode },
        link: `/member/submissions/${id}`,
        email: memberEmail,
      });
    }

    await writeAuditLog({
      actorId: adminId, actorType: "admin",
      entityType: "submission", entityId: id, action: "submission_rejected",
      before: { status: submission.status }, after: { status: "rejected", reason },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
