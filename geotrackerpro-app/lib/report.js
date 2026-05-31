// Branded HTML report used for the emailed version (inline styles for email clients).

function scoreColor(score) {
  if (score >= 75) return "#2e9e5b";
  if (score >= 60) return "#d99213";
  return "#d64545";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

export function renderReportHtml(audit) {
  const color = scoreColor(audit.overall_score);

  const factors = (audit.factors || [])
    .map((f) => {
      const fc = scoreColor(f.score);
      const steps = (f.fix_steps || [])
        .map((s) => `<li style="margin-bottom:4px;color:#555;">${esc(s)}</li>`)
        .join("");
      return `
      <tr><td style="padding:14px 0;border-top:1px solid #eee;">
        <table width="100%"><tr>
          <td style="font-weight:600;color:#1a1a2e;font-size:15px;">${esc(f.name)}
            <span style="font-weight:400;color:#999;font-size:12px;"> (${f.weight}% weight)</span></td>
          <td align="right" style="font-weight:700;color:${fc};font-size:15px;">${f.score}/100</td>
        </tr></table>
        <div style="height:7px;background:#eee;border-radius:4px;margin:8px 0;">
          <div style="height:7px;width:${f.score}%;background:${fc};border-radius:4px;"></div>
        </div>
        <div style="color:#555;font-size:14px;line-height:1.5;">${esc(f.findings)}</div>
        ${steps ? `<ul style="margin:8px 0 0;padding-left:18px;">${steps}</ul>` : ""}
      </td></tr>`;
    })
    .join("");

  const wins = (audit.top_3_wins || []).map((w) => `<li style="margin-bottom:6px;">${esc(w)}</li>`).join("");
  const issues = (audit.top_3_issues || []).map((i) => `<li style="margin-bottom:6px;">${esc(i)}</li>`).join("");
  const plan = (audit.thirty_day_action_plan || [])
    .map(
      (p) => `<tr>
        <td style="padding:10px 0;border-top:1px solid #eee;color:#5b8cff;font-weight:600;width:70px;">Week ${p.week}</td>
        <td style="padding:10px 0;border-top:1px solid #eee;color:#333;">${esc(p.action)}</td>
        <td style="padding:10px 0;border-top:1px solid #eee;color:#2e9e5b;font-weight:600;text-align:right;width:90px;">${esc(p.impact)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
<div style="max-width:640px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:8px 0 20px;">
    <div style="font-weight:700;font-size:20px;color:#5b8cff;">GeoTrackerPro</div>
    <div style="color:#888;font-size:13px;">AI Search (GEO) Audit Report</div>
  </div>

  <div style="background:#fff;border-radius:14px;padding:28px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="display:inline-block;width:120px;height:120px;border-radius:50%;background:${color};color:#fff;line-height:120px;font-size:38px;font-weight:700;">${audit.overall_score}</div>
    <div style="margin-top:14px;font-size:15px;color:#666;">${esc(audit.url_audited)}</div>
    <div style="margin-top:8px;display:inline-block;background:${color};color:#fff;font-weight:700;padding:5px 14px;border-radius:999px;">Grade ${esc(audit.letter_grade)} — ${esc(audit.tier_label)}</div>
    <p style="color:#444;line-height:1.6;font-size:15px;text-align:left;margin-top:18px;">${esc(audit.executive_summary)}</p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
    <tr>
      <td width="50%" valign="top" style="padding-right:8px;">
        <div style="background:#fff;border-radius:14px;padding:20px;">
          <div style="font-weight:700;color:#2e9e5b;margin-bottom:10px;">Top Wins</div>
          <ul style="margin:0;padding-left:18px;color:#444;font-size:14px;">${wins}</ul>
        </div>
      </td>
      <td width="50%" valign="top" style="padding-left:8px;">
        <div style="background:#fff;border-radius:14px;padding:20px;">
          <div style="font-weight:700;color:#d64545;margin-bottom:10px;">Top Issues</div>
          <ul style="margin:0;padding-left:18px;color:#444;font-size:14px;">${issues}</ul>
        </div>
      </td>
    </tr>
  </table>

  <div style="background:#fff;border-radius:14px;padding:24px;margin-top:16px;">
    <div style="font-weight:700;font-size:18px;margin-bottom:6px;">Your 10-Factor Breakdown</div>
    <table width="100%" cellpadding="0" cellspacing="0">${factors}</table>
  </div>

  <div style="background:#fff;border-radius:14px;padding:24px;margin-top:16px;">
    <div style="font-weight:700;font-size:18px;margin-bottom:6px;">Your 30-Day Action Plan</div>
    <table width="100%" cellpadding="0" cellspacing="0">${plan}</table>
  </div>

  <div style="background:linear-gradient(135deg,#5b8cff,#8a6bff);border-radius:14px;padding:28px;margin-top:16px;text-align:center;color:#fff;">
    <div style="font-weight:700;font-size:20px;margin-bottom:8px;">Want us to fix all of this for you?</div>
    <div style="font-size:15px;opacity:0.92;line-height:1.5;">The 808 AI Group does done-for-you GEO optimization — we implement every fix in this report so your business shows up in ChatGPT, Claude, Perplexity, and Gemini answers.</div>
  </div>

  <div style="text-align:center;color:#aaa;font-size:12px;margin-top:20px;">
    GeoTrackerPro by The 808 AI Group · Audited ${esc(audit.audit_date)}
  </div>
</div>
</body></html>`;
}
