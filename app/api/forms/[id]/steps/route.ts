import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { formSteps } from "@/db/forms-schema";
import { eq, asc } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const steps = await db.select().from(formSteps)
    .where(eq(formSteps.formId, id))
    .orderBy(asc(formSteps.stepOrder));
  return NextResponse.json({ steps });
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { title, titleNe, description, stepOrder } = await request.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const [step] = await db.insert(formSteps).values({
      formId: id, title, titleNe: titleNe ?? null,
      description: description ?? null, stepOrder: stepOrder ?? 0,
    }).returning();

    return NextResponse.json({ step }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const { stepId, ...updates } = body;
    if (!stepId) return NextResponse.json({ error: "stepId required" }, { status: 400 });

    const [step] = await db.update(formSteps).set(updates)
      .where(eq(formSteps.id, stepId)).returning();
    return NextResponse.json({ step });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, _p: Params) {
  try {
    const { stepId } = await request.json();
    if (!stepId) return NextResponse.json({ error: "stepId required" }, { status: 400 });
    await db.delete(formSteps).where(eq(formSteps.id, stepId));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
