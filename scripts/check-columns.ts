import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkColumns() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: notice, error } = await supabase.from('notices').select('*').limit(1).single();
  if (error) console.error(error);
  else console.log("Notice columns:", Object.keys(notice));

  const { data: user, error: userError } = await supabase.from('public_users').select('*').limit(1).single();
  if (userError) console.error(userError);
  else console.log("User columns:", Object.keys(user));
}

checkColumns();
