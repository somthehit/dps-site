import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/forms-schema";
import { eq, and, isNull, desc } from "drizzle-orm";

// GET /api/notifications?userId=&userType=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType") ?? "member";

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Use correct column based on userType (memberId or adminId)
    const notifs = userType === "admin"
      ? await db.select().from(notifications).where(eq(notifications.adminId, userId)).orderBy(desc(notifications.createdAt))
      : await db.select().from(notifications).where(eq(notifications.memberId, userId)).orderBy(desc(notifications.createdAt));

    const unread = notifs.filter((n) => !n.readAt).length;

    return NextResponse.json({ notifications: notifs, unread });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH /api/notifications — mark as read
// Body: { id } or { userId, markAll: true }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.id) {
      await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, body.id));
    } else if (body.markAll && body.userId && body.userType) {
      // Use correct column based on userType
      const userIdColumn = body.userType === "admin" ? notifications.adminId : notifications.memberId;
      await db.update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(userIdColumn, body.userId), isNull(notifications.readAt)));
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
