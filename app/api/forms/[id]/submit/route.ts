import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  forms, formFields, formSteps, formSubmissions,
  submissionValues, approvalWorkflows,
} from "@/db/forms-schema";
import { systemUsers } from "@/db/schema";
import { eq, asc, isNull, and, gte, count } from "drizzle-orm";
import { generateSubmissionCode } from "@/lib/forms/submission-code";
import { buildFormSnapshot } from "@/lib/forms/snapshot";
import { validateField } from "@/lib/forms/validation";
import { createNotification } from "@/lib/forms/notifications";
import { writeAuditLog } from "@/lib/forms/audit";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ id: string }> };

// POST /api/forms/[id]/submit
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: formId } = await params;
    const body = await request.json();
    const { memberId, memberEmail, values, isDraft = false } = body;

    // 1. Load form
    const [form] = await db.select().from(forms).where(
      and(eq(forms.id, formId), isNull(forms.deletedAt))
    );
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
    if (form.status !== "published" && !isDraft) {
      return NextResponse.json({ error: "Form is not accepting submissions" }, { status: 403 });
    }

    // 1.1 Check availability duration
    const now = new Date();
    if (!isDraft) {
      if (form.startAt && now < new Date(form.startAt)) {
        return NextResponse.json({ error: "Form is not active yet / फाराम अझै सक्रिय भएको छैन" }, { status: 403 });
      }
      if (form.endAt && now > new Date(form.endAt)) {
        return NextResponse.json({ error: "Form has expired / फारामको समय सकिएको छ" }, { status: 403 });
      }
    }

    // 1.2 Check global submission limit
    if (!isDraft && form.submissionLimit) {
      const [totalCount] = await db
        .select({ c: count() })
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId));

      if ((totalCount?.c ?? 0) >= form.submissionLimit) {
        return NextResponse.json({ error: "Submission limit reached / पेश गर्ने सीमा सकिएको छ" }, { status: 403 });
      }
    }

    // 2. Rate limiting — check submissions in last minute and today
    if (!isDraft && memberId) {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const todayStart = new Date(now.setHours(0, 0, 0, 0));

      const [recentCount] = await db
        .select({ c: count() })
        .from(formSubmissions)
        .where(
          and(
            eq(formSubmissions.formId, formId),
            eq(formSubmissions.memberId, memberId),
            gte(formSubmissions.createdAt, oneMinuteAgo)
          )
        );

      if ((recentCount?.c ?? 0) >= form.rateLimitPerMinute) {
        return NextResponse.json(
          { error: "Too many submissions. Please wait a moment." },
          { status: 429 }
        );
      }

      const [dailyCount] = await db
        .select({ c: count() })
        .from(formSubmissions)
        .where(
          and(
            eq(formSubmissions.formId, formId),
            eq(formSubmissions.memberId, memberId),
            gte(formSubmissions.createdAt, todayStart)
          )
        );

      if ((dailyCount?.c ?? 0) >= form.rateLimitPerDay) {
        return NextResponse.json(
          { error: "Daily submission limit reached for this form." },
          { status: 429 }
        );
      }
    }

    // 3. Load active fields
    const fields = await db.select().from(formFields).where(
      and(eq(formFields.formId, formId), isNull(formFields.deletedAt))
    ).orderBy(asc(formFields.sortOrder));

    // 4. Server-side validation (skip for drafts)
    if (!isDraft) {
      const errors: { field: string; message: string }[] = [];
      for (const field of fields) {
        if (field.isHidden) continue;
        const value = values?.[field.fieldName];
        const err = validateField(
          field.fieldName, field.fieldType, value,
          field.isRequired, field.validationJson as Parameters<typeof validateField>[4]
        );
        if (err) errors.push(err);
      }
      if (errors.length > 0) {
        return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
      }
    }

    // 5. Build schema snapshot
    const snapshot = await buildFormSnapshot(formId);

    // 6. Load workflow (if configured)
    const [workflow] = form.status === "published"
      ? await db.select().from(approvalWorkflows).where(
        and(eq(approvalWorkflows.formId, formId), eq(approvalWorkflows.isActive, true))
      )
      : [null];

    // 7. Generate submission code
    const submissionCode = isDraft
      ? `DRAFT-${Date.now()}`
      : await generateSubmissionCode(form.category);

    // 8. Calculate SLA due date (48h default)
    const dueAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 9. Insert submission
    const [submission] = await db.insert(formSubmissions).values({
      formId,
      memberId: memberId ?? null,
      submissionCode,
      status: isDraft ? "draft" : "submitted",
      schemaSnapshot: snapshot as unknown as { fields: unknown[]; steps?: unknown[]; metadata?: Record<string, unknown> },
      workflowId: workflow?.id ?? null,
      currentStep: 0,
      dueAt: isDraft ? null : dueAt,
      submittedAt: isDraft ? null : new Date(),
    }).returning();

    // 10. Insert field values
    if (values && typeof values === "object") {
      const valueRows = fields.map((field) => {
        const val = values[field.fieldName];
        const isJsonField = ["checkbox", "multiselect", "address", "gps", "signature"].includes(field.fieldType);
        const isNumeric = ["number", "currency"].includes(field.fieldType);
        const isBool = field.fieldType === "radio" && typeof val === "boolean";

        return {
          submissionId: submission.id,
          fieldId: field.id,
          fieldName: field.fieldName,
          valueText: (!isJsonField && !isNumeric && !isBool && val !== undefined) ? String(val ?? "") : null,
          valueJson: isJsonField ? val : null,
          valueNumber: isNumeric && val !== undefined ? String(val) : null,
          valueBoolean: isBool ? Boolean(val) : null,
        };
      }).filter((r) => r.valueText !== null || r.valueJson !== null || r.valueNumber !== null || r.valueBoolean !== null);

      if (valueRows.length > 0) {
        await db.insert(submissionValues).values(valueRows);
      }
    }

    // 11. Notify admin of new submission (non-blocking)
    if (!isDraft) {
      const admins = await db.select({ id: systemUsers.id, email: systemUsers.email }).from(systemUsers);
      for (const admin of admins) {
        createNotification({
          userId: admin.id,
          userType: "admin",
          type: "new_submission",
          title: `New submission: ${form.name}`,
          message: `Submission ${submissionCode} received`,
          payload: { submissionId: submission.id, formId, formName: form.name },
          link: `/admin/submissions/${submission.id}`,
          email: admin.email, // Send email to admin
        });
      }

      // Also notify member
      if (memberId) {
        createNotification({
          userId: memberId,
          userType: "member",
          type: "submission_created",
          title: "Form submitted successfully / फाराम सफलतापूर्वक पेश भयो",
          message: `Your submission ID: ${submissionCode}`,
          payload: { submissionId: submission.id, submissionCode },
          link: `/member/submissions/${submission.id}`,
          email: memberEmail,
        });
      }
    }

    await writeAuditLog({
      actorId: memberId, actorType: "member",
      entityType: "submission", entityId: submission.id,
      action: "submission_created",
      after: { submissionCode, formId, status: submission.status },
    });

    if (!isDraft && form.submissionLimit) {
      const [totalCount] = await db
        .select({ c: count() })
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId));

      if ((totalCount?.c ?? 0) >= form.submissionLimit) {
        await db.update(forms).set({ status: "unpublished" }).where(eq(forms.id, formId));
      }
    }

    return NextResponse.json({ submission, submissionCode }, { status: 201 });
  } catch (err: unknown) {
    console.error("[submit] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
