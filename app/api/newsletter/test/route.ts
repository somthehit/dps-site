import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: "Missing env vars",
        supabaseUrl: supabaseUrl ? "SET" : "MISSING",
        serviceKey: serviceKey ? "SET" : "MISSING",
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: "Database connection failed",
        details: error.message,
        code: error.code,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Database connection OK",
      env: {
        supabaseUrl: "SET",
        serviceKey: "SET",
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Unexpected error",
      message: error?.message || "Unknown error",
    }, { status: 500 });
  }
}
