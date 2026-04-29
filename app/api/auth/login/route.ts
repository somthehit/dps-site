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
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists in public_users with approved status
    const { data: userData, error: userError } = await supabaseAdmin
      .from('public_users')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Account not found or not approved yet" },
        { status: 404 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash || "")
    if (!isPasswordValid) {
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
        fullName: userData.full_name,
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
