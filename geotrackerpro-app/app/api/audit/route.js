import { scrapeSite } from "../../../lib/scraper.js";
import { runAudit } from "../../../lib/claude.js";
import { renderReportHtml } from "../../../lib/report.js";
import { sendReportEmail } from "../../../lib/email.js";
import { saveLead } from "../../../lib/db.js";

// Allow up to 60s — scrape + Claude can take 30-50s. (Vercel: Hobby/Pro support this.)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  let { url, email, firstName, businessName, industry } = body || {};
  if (!url || !email) {
    return Response.json(
      { error: "Website URL and email are both required." },
      { status: 400 }
    );
  }
  url = String(url).trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    const scraped = await scrapeSite(url);
    const { audit, usage } = await runAudit({
      url,
      businessName,
      industry,
      scraped,
    });

    const reportHtml = renderReportHtml(audit);

    // Optional side effects (no-ops if not configured) — don't block on them.
    const [emailResult] = await Promise.all([
      sendReportEmail({ to: email, audit, reportHtml }),
      saveLead({
        url,
        email,
        first_name: firstName || null,
        business_name: businessName || null,
        industry: industry || null,
        overall_score: audit.overall_score,
        letter_grade: audit.letter_grade,
        tier_label: audit.tier_label,
        audit_json: audit,
        status: "sent",
        tier: "free",
        ip_address: ip,
      }),
    ]);

    return Response.json({
      audit,
      emailed: emailResult.sent,
      tokens: usage?.input_tokens
        ? { input: usage.input_tokens, output: usage.output_tokens }
        : null,
    });
  } catch (e) {
    console.error("Audit failed:", e);
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
