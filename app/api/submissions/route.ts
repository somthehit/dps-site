import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, submissionValues, submissionFiles, forms } from "@/db/forms-schema";
import { eq, desc, and, gte, lte, or, ilike } from "drizzle-orm";

// GET /api/submissions
// Query params: formId, memberId, status, from, to, search, page, limit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");
    const memberId = searchParams.get("memberId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = (page - 1) * limit;

    let all = await db
      .select({
        submission: formSubmissions,
        formName: forms.name,
        formCategory: forms.category,
      })
      .from(formSubmissions)
      .leftJoin(forms, eq(formSubmissions.formId, forms.id))
      .orderBy(desc(formSubmissions.createdAt));

    // Filter
    if (formId) all = all.filter((r) => r.submission.formId === formId);
    if (memberId) all = all.filter((r) => r.submission.memberId === memberId);
    if (status) all = all.filter((r) => r.submission.status === status);
    if (from) all = all.filter((r) => r.submission.createdAt! >= new Date(from));
    if (to) all = all.filter((r) => r.submission.createdAt! <= new Date(to));

    const total = all.length;
    const paginated = all.slice(offset, offset + limit);

    return NextResponse.json({
      submissions: paginated,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
