import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  formSubmissions, submissionValues, submissionFiles, forms, formFields
} from "@/db/forms-schema";
import { eq, and } from "drizzle-orm";

// GET /api/submissions/export?formId=&status=&format=csv
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");
    const status = searchParams.get("status");
    const format = searchParams.get("format") ?? "csv";

    if (!formId) return NextResponse.json({ error: "formId required" }, { status: 400 });

    // Get all submissions for this form
    let allSubs = await db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, formId));

    if (status) allSubs = allSubs.filter((s) => s.status === status);

    // Get field names for headers
    const fields = await db.select().from(formFields).where(eq(formFields.formId, formId));

    // Get all values for these submissions
    const subIds = allSubs.map((s) => s.id);
    const allValues = subIds.length > 0
      ? await Promise.all(subIds.map((sid) =>
          db.select().from(submissionValues).where(eq(submissionValues.submissionId, sid))
        ))
      : [];

    const valuesBySubmission: Record<string, typeof allValues[0]> = {};
    subIds.forEach((sid, i) => { valuesBySubmission[sid] = allValues[i]; });

    // Build CSV rows
    const fieldNames = fields.map((f) => f.fieldName);
    const headers = ["Submission Code", "Status", "Submitted At", ...fields.map((f) => f.label)];

    const rows = allSubs.map((sub) => {
      const vals = valuesBySubmission[sub.id] ?? [];
      const valMap: Record<string, string> = {};
      for (const v of vals) {
        valMap[v.fieldName] = v.valueText ?? String(v.valueJson ?? v.valueNumber ?? v.valueBoolean ?? "");
      }
      return [
        sub.submissionCode,
        sub.status,
        sub.submittedAt ? new Date(sub.submittedAt).toISOString() : "",
        ...fieldNames.map((fn) => valMap[fn] ?? ""),
      ];
    });

    if (format === "csv") {
      const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
      const csvLines = [
        headers.map(escape).join(","),
        ...rows.map((r) => r.map(escape).join(",")),
      ];
      const csv = "\ufeff" + csvLines.join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="submissions-${formId}.csv"`,
        },
      });
    }

    // JSON fallback
    return NextResponse.json({ headers, rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
