import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function checkSubscribers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing env vars");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching subscribers:", error);
    return;
  }

  console.log("Active Subscribers:");
  console.table(data.map(s => ({ email: s.email, created_at: s.created_at })));
}

checkSubscribers();
