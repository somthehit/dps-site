import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const rows = await db.select().from(siteSettings);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as Array<{ key: string; value: string }>;
  for (const item of body) {
    await db
      .insert(siteSettings)
      .values({ key: item.key, value: item.value, label: item.key, group: "contact" })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: item.value } });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { key: string; value: string; label?: string; group?: string };
  await db
    .insert(siteSettings)
    .values({
      key: body.key,
      value: body.value,
      label: body.label ?? body.key,
      group: body.group ?? "contact",
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: body.value },
    });
  return NextResponse.json({ ok: true });
}
