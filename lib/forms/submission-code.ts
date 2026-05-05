import { createClient } from "@supabase/supabase-js";

const CATEGORY_PREFIXES: Record<string, string> = {
  loan: "LOAN",
  savings: "SAV",
  fertilizer: "FER",
  member_services: "MEM",
  complaint: "CMP",
  hr: "HR",
  share: "SHR",
  custom: "GEN",
};

/** Generate a unique submission code like LOAN-2026-0001 */
export async function generateSubmissionCode(category: string): Promise<string> {
  const prefix = CATEGORY_PREFIXES[category] ?? "GEN";
  const year = new Date().getFullYear();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceKey);

  // Count submissions this year with the same prefix to build the sequence
  const yearStart = `${year}-01-01T00:00:00.000Z`;
  const { count } = await supabase
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .like("submission_code", `${prefix}-${year}-%`)
    .gte("created_at", yearStart);

  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
}
