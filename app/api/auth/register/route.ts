import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { publicUsers } from "@/db/schema";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, address, citizenshipNo, password, citizenshipFrontUrl, citizenshipBackUrl } = body;

    if (!fullName || !email || !phone || !address || !citizenshipNo || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into public_users table
    await db.insert(publicUsers).values({
      fullName,
      email,
      phone,
      address,
      citizenshipNo,
      citizenshipFrontUrl: citizenshipFrontUrl || null,
      citizenshipBackUrl: citizenshipBackUrl || null,
      passwordHash: hashedPassword,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully. Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Registration API error:", error);
    
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
