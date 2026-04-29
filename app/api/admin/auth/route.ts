// Admin authentication API route
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log("Login attempt for:", email);

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // 1. Find user in database
    console.log("Querying database for user...");
    const users = await db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.email, email));

    console.log("Found users:", users.length);
    const [user] = users;

    if (!user) {
      console.log("User not found in DB:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("User found:", user.email, "Has password hash:", !!user.passwordHash);

    if (!user.passwordHash) {
      console.log("User has no password hash:", email);
      return NextResponse.json({ error: "Account not setup for password login" }, { status: 401 });
    }

    // 2. Verify password
    console.log("Comparing password...");
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password validation result:", isValid);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Set session cookies
    console.log("Setting secure session cookie for:", user.email);
    const cookieStore = await cookies();
    
    // Generate secure JWT
    const token = await signToken({ email: user.email, id: user.id });
    
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  // Ensure the legacy admin_token is also deleted
  cookieStore.delete("admin_token");
  return NextResponse.json({ ok: true });
}
