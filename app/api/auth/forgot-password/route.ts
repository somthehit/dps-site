import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing env vars");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Check if user exists in public_users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('public_users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Store reset token in the database
    const { error: updateError } = await supabaseAdmin
      .from('public_users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      })
      .eq('email', email);

    if (updateError) {
      console.error("Failed to store reset token:", updateError);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }

    // In a real application, you would send an email here
    // For now, we'll return the reset link in the response (for development/testing)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log("Password reset link generated:", resetLink);

    return NextResponse.json({
      success: true,
      message: "Password reset link has been generated.",
      // Only include these in development
      ...(process.env.NODE_ENV === 'development' && {
        resetLink,
        token: resetToken,
      }),
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
