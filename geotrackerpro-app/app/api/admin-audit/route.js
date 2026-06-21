import { scrapeSite } from "../../../lib/scraper.js";
import { runAudit } from "../../../lib/claude.js";
import { saveLead } from "../../../lib/db.js";

// Admin-only quick audit: URL is the ONLY required input. No lead capture,
// no email send. Business name is auto-derived from the domain. Protected by
// middleware (same cookie auth as the rest of the internal app).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// SSRF guard — block localhost, private ranges, and non-http schemes.
function isSafeUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (!/^https?:$/.test(u.protocol)) return false;
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  )
    return false;
  if (
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  )
    return false;
  return true;
}

// "https://www.acme-builders.com/about" -> "Acme Builders"
function nameFromUrl(raw) {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    const core = host.split(".")[0] || host;
    return core
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  let { url, businessName, industry } = body || {};
  if (!url) {
    return Response.json({ error: "Please enter a website URL." }, { status: 400 });
  }
  url = String(url).trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  if (!isSafeUrl(url)) {
    return Response.json(
      { error: "That URL can't be audited. Use a public http(s) website address." },
      { status: 400 }
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Audit engine not configured (missing ANTHROPIC_API_KEY)." },
      { status: 500 }
    );
  }

  const derivedName = (businessName && String(businessName).trim()) || nameFromUrl(url);

  try {
    const scraped = await scrapeSite(url);
    const { audit, usage } = await runAudit({
      url,
      businessName: derivedName,
      industry: industry || "",
      scraped,
    });

    // Save to Supabase so it appears in /dashboard and /reports. Tagged as an
    // admin-run audit (no lead contact info). No-op if Supabase isn't configured.
    const saved = await saveLead({
      url,
      email: null,
      first_name: null,
      phone: null,
      business_name: derivedName || null,
      industry: industry || null,
      overall_score: audit.overall_score,
      letter_grade: audit.letter_grade,
      tier_label: audit.tier_label,
      audit_json: audit,
      status: "admin",
      tier: "admin",
      ip_address: "admin",
    });

    return Response.json({
      audit,
      businessName: derivedName,
      saved: saved.saved,
      tokens: usage?.input_tokens
        ? { input: usage.input_tokens, output: usage.output_tokens }
        : null,
    });
  } catch (e) {
    console.error("Admin audit failed:", e);
    return Response.json(
      {
        error:
          e.message ||
          "The audit failed. The site may be blocking automated requests — try another URL.",
      },
      { status: 502 }
    );
  }
}
