import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // For requests, we don't assign a memberCode or joinDate yet.
    // They will be assigned upon admin approval.
    
    const [newRequest] = await db.insert(members).values({
      ...body,
      status: 'pending', // Explicitly set to pending
      memberCode: null,
      joinDate: null,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      message: "Your membership request has been submitted successfully. Our team will review it and get back to you.",
      id: newRequest.id 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Membership Request Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
