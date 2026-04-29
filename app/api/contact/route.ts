import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
    return NextResponse.json(rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation
    const { name, email, phone, subject, message } = body;
    if (!name || !phone || !subject || !message) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const [result] = await db.insert(contactMessages).values({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
    }).returning();

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Contact API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
