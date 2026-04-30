import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';

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
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing env vars");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    
    // Create Resend client inside request handler
    const resend = new Resend(resendApiKey);

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

    // Generate reset link - use deployed URL or env var
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dps-site-w47q.vercel.app';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log("Password reset link generated:", resetLink);

    // Send email using Resend
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Dipshikha Sahakari <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset - दिपशिखा कृषि सहकारी संस्था',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #166534; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">दिपशिखा कृषि सहकारी संस्था</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Dipshikha Krishi Sahakari Sanstha</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #4b5563; line-height: 1.6;">नमस्ते ${userData.full_name || 'Member'},</p>
              <p style="color: #4b5563; line-height: 1.6;">
                We received a request to reset your password. Click the button below to reset your password:
              </p>
              <p style="color: #4b5563; line-height: 1.6;">
                हामीले तपाईंको पासवर्ड रिसेट गर्न अनुरोध प्राप्त गर्यौं। पासवर्ड रिसेट गर्न तलको बटनमा क्लिक गर्नुहोस्:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Reset Password / पासवर्ड रिसेट गर्नुहोस्
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link in your browser:<br>
                <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${resetLink}</code>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request this, please ignore this email.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                यो लिङ्क २४ घण्टामा समाप्त हुनेछ। यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने, कृपया यो इमेल बेवास्ता गर्नुहोस्।
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">© 2024 Dipshikha Krishi Sahakari Sanstha. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
        // Still return success to user for security, but log the error
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        });
      }

      console.log("Email sent successfully:", emailData);
    } catch (emailSendError) {
      console.error("Email send error:", emailSendError);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
