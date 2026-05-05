import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  formSubmissions, submissionValues, submissionFiles,
  approvalLogs, forms,
} from "@/db/forms-schema";
import { eq } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";

type Params = { params: Promise<{ id: string }> };

// GET /api/submissions/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [values, files, logs, form] = await Promise.all([
      db.select().from(submissionValues).where(eq(submissionValues.submissionId, id)),
      db.select().from(submissionFiles).where(eq(submissionFiles.submissionId, id)),
      db.select().from(approvalLogs).where(eq(approvalLogs.submissionId, id)),
      db.select({ name: forms.name, category: forms.category }).from(forms).where(eq(forms.id, submission.formId)),
    ]);

    return NextResponse.json({ submission, values, files, logs, form: form[0] ?? null });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH /api/submissions/[id] — update status or assignment
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [before] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const allowed = ["status", "assignedTo", "currentStep", "dueAt"] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const [updated] = await db.update(formSubmissions).set(updates as unknown as Partial<typeof formSubmissions.$inferInsert>)
      .where(eq(formSubmissions.id, id)).returning();

    await writeAuditLog({
      entityType: "submission", entityId: id, action: "submission_created",
      before: { status: before.status }, after: updates,
    });

    return NextResponse.json({ submission: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
