import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email.toLowerCase().trim()),
    });

    if (existing) {
      if (!existing.isActive) {
        // Re-activate
        await db
          .update(newsletterSubscribers)
          .set({ isActive: true, subscribedAt: new Date() })
          .where(eq(newsletterSubscribers.id, existing.id));
        return NextResponse.json({ message: "Subscription re-activated!" });
      }
      return NextResponse.json(
        { message: "You are already subscribed!" },
        { status: 200 }
      );
    }

    // New subscription
    await db.insert(newsletterSubscribers).values({
      email: email.toLowerCase().trim(),
    });

    return NextResponse.json(
      { message: "Thank you for subscribing!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
