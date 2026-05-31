// Optional Resend delivery. No-op if RESEND_API_KEY is not set.

export async function sendReportEmail({ to, audit, reportHtml }) {
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "reports@geotrackerpro.ai";
    const fromName = process.env.RESEND_FROM_NAME || "GeoTrackerPro";
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject: `Your GEO Audit Report — Score: ${audit.overall_score}/100 (${audit.letter_grade})`,
      html: reportHtml,
      tags: [{ name: "category", value: "geo-audit-report" }],
    });
    return { sent: true, id: result?.data?.id };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}
