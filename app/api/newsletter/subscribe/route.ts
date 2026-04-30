import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing env vars:", { 
        supabaseUrl: supabaseUrl ? "SET" : "MISSING", 
        serviceKey: serviceKey ? "SET" : "MISSING" 
      });
      return NextResponse.json(
        { error: `Server config error: ${!supabaseUrl ? "SUPABASE_URL" : "SERVICE_KEY"} missing` },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Fetch error:", fetchError);
    }

    if (existing) {
      if (!existing.is_active) {
        // Re-activate
        const { error: updateError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) {
          console.error("Re-activate error:", updateError);
          return NextResponse.json(
            { error: "Failed to re-activate subscription" },
            { status: 500 }
          );
        }
        return NextResponse.json({ message: "Subscription re-activated!" });
      }
      return NextResponse.json(
        { message: "You are already subscribed!" },
        { status: 200 }
      );
    }

    // New subscription
    const { error: insertError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        is_active: true,
      });

    if (insertError) {
      console.error("Insert error details:", JSON.stringify(insertError, null, 2));
      // Check for duplicate email error
      if (insertError.message?.includes("duplicate") || insertError.message?.includes("unique") || insertError.code === "23505") {
        return NextResponse.json(
          { message: "You are already subscribed!" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: `Failed to subscribe: ${insertError.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Thank you for subscribing!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter subscription catch error:", error?.message || error);
    console.error("Full error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: `Failed to subscribe: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
