import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { noticeId } = await request.json();

    if (!noticeId) {
      return NextResponse.json(
        { error: "Notice ID is required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dps-site-w47q.vercel.app';

    // Fetch notice details
    const { data: notice, error: noticeError } = await supabaseAdmin
      .from('notices')
      .select('*')
      .eq('id', noticeId)
      .single();

    if (noticeError || !notice) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 }
      );
    }

    // Fetch all active subscribers
    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subscribersError) {
      console.error("Failed to fetch subscribers:", subscribersError);
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { message: "No active subscribers found" },
        { status: 200 }
      );
    }

    // Format date
    const publishedDate = new Date(notice.created_at || Date.now()).toLocaleDateString('ne-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email content
    const subject = `🎉 नयाँ सूचना: ${notice.title_ne} / New Notice: ${notice.title_en}`;
    const noticeUrl = `${appUrl}/notices/${noticeId}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #166534; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">दिपशिखा कृषि सहकारी संस्था</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Dipshikha Krishi Sahakari Sanstha</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: #dc2626; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              नयाँ सूचना / NEW NOTICE
            </span>
          </div>
          
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${notice.title_ne}</h2>
          <h3 style="color: #4b5563; margin-top: 5px; font-size: 16px; font-weight: normal;">${notice.title_en}</h3>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            📅 प्रकाशित मिति / Published Date: ${publishedDate}
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #4b5563; line-height: 1.6; margin: 0;">
              ${notice.desc_ne || notice.desc_en || 'थप जानकारीको लागि तलको लिङ्कमा क्लिक गर्नुहोस्।'}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${noticeUrl}" 
               style="background: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              पूर्ण सूचना हेर्नुहोस् / View Full Notice →
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            तपाईंले यो इमेल दिपशिखा कृषि सहकारीको न्यूजलेटर सदस्यता लिएकोले प्राप्त गर्नुभएको हो।<br>
            You received this email because you subscribed to Dipshikha Sahakari newsletter.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">© 2024 Dipshikha Krishi Sahakari Sanstha. All rights reserved.</p>
          <p style="margin: 5px 0 0 0; font-size: 11px;">
            <a href="${appUrl}/contact" style="color: #166534;">Contact Us / सम्पर्क गर्नुहोस्</a>
          </p>
        </div>
      </div>
    `;

    // Send emails
    let sentCount = 0;
    let failedCount = 0;
    let lastError = "";

    // Process each subscriber
    // In production with many subscribers, this should be moved to a background job
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject: subject,
          html: htmlContent,
        });
        sentCount++;
      } catch (error: any) {
        console.error(`Failed to send to ${sub.email}:`, error.message);
        failedCount++;
        lastError = error.message;
      }
    }

    // Update email_sent_count for all active subscribers if some were sent
    if (sentCount > 0) {
      try {
        const { error: updateError } = await supabaseAdmin
          .rpc('increment_email_sent_count');

        if (updateError) {
          // Fallback: update using raw SQL if RPC doesn't exist
          await supabaseAdmin.from('newsletter_subscribers')
            .update({ last_email_sent_at: new Date().toISOString() })
            .eq('is_active', true);
        }
      } catch (err) {
        console.error("Error updating email counts:", err);
      }
    }

    // If all failed, include error details
    if (sentCount === 0 && failedCount > 0) {
      return NextResponse.json({
        success: false,
        message: `All emails failed to send`,
        sentCount,
        failedCount,
        totalSubscribers: subscribers.length,
        noticeTitle: notice.title_ne,
        error: lastError || "Unknown email service error"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Notice broadcast completed. Sent: ${sentCount}, Failed: ${failedCount}`,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length,
      noticeTitle: notice.title_ne,
    });

  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: `Failed to broadcast notice: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

