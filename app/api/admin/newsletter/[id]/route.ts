import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Helper to get Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing environment variables");
  }
  
  return createClient(supabaseUrl, serviceKey);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Subscriber deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({ is_active: isActive })
      .eq('id', id);
    
    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    
    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
