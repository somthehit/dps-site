import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms } from "@/db/forms-schema";
import { eq, isNull, desc } from "drizzle-orm";
import { writeAuditLog } from "@/lib/forms/audit";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET /api/forms — list all non-deleted forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");
    const publicOnly = searchParams.get("public") === "1";

    let query = db.select().from(forms).where(isNull(forms.deletedAt)).orderBy(desc(forms.createdAt));

    const allForms = await query;

    let filtered = allForms.filter((f) => !f.isArchived || statusFilter === "archived");

    if (statusFilter && statusFilter !== "archived") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }
    if (publicOnly) {
      // For member portal: only published, within date range
      const now = new Date();
      filtered = filtered.filter((f) => {
        if (f.status !== "published") return false;
        if (f.startAt && new Date(f.startAt) > now) return false;
        if (f.endAt && new Date(f.endAt) < now) return false;
        return true;
      });
    }

    return NextResponse.json({ forms: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/forms — create new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, category, accessType, isMultiStep } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.select({ id: forms.id }).from(forms).where(eq(forms.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const [newForm] = await db.insert(forms).values({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      description: description ?? null,
      category: category ?? "custom",
      status: "draft",
      accessType: accessType ?? "members_only",
      isMultiStep: isMultiStep ?? false,
    }).returning();

    await writeAuditLog({
      entityType: "form",
      entityId: newForm.id,
      action: "form_created",
      after: { name, slug, category },
    });

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
