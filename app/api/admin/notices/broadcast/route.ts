import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';
import { NextRequest, NextResponse } from "next/server";

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
    const resendApiKey = process.env.RESEND_API_KEY;
    
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

    // If Resend API key is not available, return subscriber count
    if (!resendApiKey) {
      return NextResponse.json({
        message: "Email service not configured",
        subscriberCount: subscribers.length,
        noticeTitle: notice.title,
      }, { status: 200 });
    }

    const resend = new Resend(resendApiKey);

    // Format date
    const publishedDate = new Date(notice.created_at || Date.now()).toLocaleDateString('ne-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email content
    const subject = `🎉 नयाँ सूचना: ${notice.title} / New Notice: ${notice.title}`;
    const noticeUrl = `${appUrl}/notices/${noticeId}`;

    // Send emails (Resend allows batch sending)
    const emails = subscribers.map((sub: { email: string }) => ({
      from: 'दिपशिखा सहकारी <onboarding@resend.dev>',
      to: sub.email,
      subject: subject,
      html: `
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
            
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${notice.title}</h2>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              📅 प्रकाशित मिति / Published Date: ${publishedDate}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">
                ${notice.content ? notice.content.substring(0, 200) + '...' : 'थप जानकारीको लागि तलको लिङ्कमा क्लिक गर्नुहोस्।'}
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
      `,
    }));

    // Send emails in batches of 100 (Resend limit)
    const batchSize = 100;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const results = await Promise.all(
          batch.map(email => 
            resend.emails.send(email).catch(err => {
              console.error(`Failed to send to ${email.to}:`, err);
              return { error: err };
            })
          )
        );
        
        const batchSent = results.filter(r => !r.error).length;
        const batchFailed = results.filter(r => r.error).length;
        sentCount += batchSent;
        failedCount += batchFailed;
      } catch (error) {
        console.error("Batch send error:", error);
        failedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notice broadcast completed`,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length,
      noticeTitle: notice.title,
    });

  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: `Failed to broadcast notice: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
