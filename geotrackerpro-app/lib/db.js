// Optional Supabase lead storage. No-op if env not set.

export async function saveLead(record) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return { saved: false, reason: "Supabase not configured" };
  }
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    const { error } = await supabase.from("audits").insert(record);
    if (error) return { saved: false, reason: error.message };
    return { saved: true };
  } catch (e) {
    return { saved: false, reason: e.message };
  }
}

// Read recent audits for the dashboard. Returns { ok, audits } or { ok:false }.
export async function getAudits(limit = 100) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return { ok: false, reason: "Supabase not configured", audits: [] };
  }
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    const { data, error } = await supabase
      .from("audits")
      .select("id, created_at, url, email, phone, first_name, business_name, industry, overall_score, letter_grade, tier_label, audit_json")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { ok: false, reason: error.message, audits: [] };
    return { ok: true, audits: data || [] };
  } catch (e) {
    return { ok: false, reason: e.message, audits: [] };
  }
}
