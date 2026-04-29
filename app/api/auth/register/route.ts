import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing env vars:", { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase admin client inside request handler
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    
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

    // Insert into public_users table using Supabase admin client (bypasses RLS)
    const { error: insertError } = await supabaseAdmin
      .from('public_users')
      .insert({
        full_name: fullName,
        email,
        phone,
        address,
        citizenship_no: citizenshipNo,
        citizenship_front_url: citizenshipFrontUrl || null,
        citizenship_back_url: citizenshipBackUrl || null,
        password_hash: hashedPassword,
        status: 'pending',
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully. Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Registration API error:", error);
    
    // Log full error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
