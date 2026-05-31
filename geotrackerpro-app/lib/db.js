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
