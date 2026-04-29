import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { publicUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists in public_users with approved status
    const user = await db
      .select()
      .from(publicUsers)
      .where(
        and(
          eq(publicUsers.email, email),
          eq(publicUsers.status, "approved")
        )
      )
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Account not found or not approved yet" },
        { status: 404 }
      );
    }

    const userData = user[0];

    // Verify password
    if (userData.passwordHash !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
